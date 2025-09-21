import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: input,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Clear notifications cache for receiver
    await this.redis.del(`notifications:${input.receiverId}`);

    // Here you would typically send push notification
    // await this.sendPushNotification(notification);

    return notification;
  }

  async findAll(userId: string, skip = 0, take = 20) {
    const cacheKey = `notifications:${userId}:${skip}:${take}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { receiverId: userId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({
        where: { receiverId: userId },
      }),
      this.prisma.notification.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      }),
    ]);

    const result = {
      notifications,
      total,
      unreadCount,
      hasMore: skip + take < total,
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        receiverId: userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    // Clear cache
    await this.clearUserNotificationsCache(userId);

    return { success: true, message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Clear cache
    await this.clearUserNotificationsCache(userId);

    return { success: true, message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  private async clearUserNotificationsCache(userId: string) {
    // Clear all cached pages for this user
    const keys = await this.redis.del(`notifications:${userId}*`);
  }

  // Helper methods for creating specific notification types
  async createLikeNotification(postId: string, likerUserId: string, postAuthorId: string) {
    if (likerUserId === postAuthorId) return; // Don't notify self

    return this.create({
      senderId: likerUserId,
      receiverId: postAuthorId,
      type: NotificationType.LIKE,
      title: 'New Like',
      message: 'liked your post',
      data: { postId },
    });
  }

  async createCommentNotification(postId: string, commenterUserId: string, postAuthorId: string) {
    if (commenterUserId === postAuthorId) return; // Don't notify self

    return this.create({
      senderId: commenterUserId,
      receiverId: postAuthorId,
      type: NotificationType.COMMENT,
      title: 'New Comment',
      message: 'commented on your post',
      data: { postId },
    });
  }

  async createFollowNotification(followerId: string, followingId: string) {
    return this.create({
      senderId: followerId,
      receiverId: followingId,
      type: NotificationType.FOLLOW,
      title: 'New Follower',
      message: 'started following you',
      data: { userId: followerId },
    });
  }
}
