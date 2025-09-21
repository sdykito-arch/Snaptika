import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersArgs } from './dto/users.args';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(args: UsersArgs) {
    const { skip = 0, take = 20, search } = args;

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
          isActive: true,
        }
      : { isActive: true };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      hasMore: skip + take < total,
    };
  }

  async findOne(id: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;

    // Add follow status if current user is provided
    if (currentUserId && currentUserId !== id) {
      const [isFollowing, isFollowedBy] = await Promise.all([
        this.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: id,
            },
          },
        }),
        this.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: id,
              followingId: currentUserId,
            },
          },
        }),
      ]);

      return {
        ...userWithoutPassword,
        isFollowing: !!isFollowing,
        isFollowedBy: !!isFollowedBy,
      };
    }

    return userWithoutPassword;
  }

  async findByUsername(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    return this.findOne(user.id, currentUserId);
  }

  async update(id: string, updateUserInput: UpdateUserInput, currentUserId: string) {
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Check if username is taken (if being updated)
    if (updateUserInput.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: updateUserInput.username },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ForbiddenException('Username is already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserInput,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async followUser(followingId: string, currentUserId: string) {
    if (followingId === currentUserId) {
      throw new ForbiddenException('You cannot follow yourself');
    }

    const userToFollow = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow || !userToFollow.isActive) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ForbiddenException('Already following this user');
    }

    await this.prisma.$transaction([
      this.prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId,
        },
      }),
      this.prisma.user.update({
        where: { id: currentUserId },
        data: { followingCount: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    return { success: true, message: 'User followed successfully' };
  }

  async unfollowUser(followingId: string, currentUserId: string) {
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('You are not following this user');
    }

    await this.prisma.$transaction([
      this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId,
          },
        },
      }),
      this.prisma.user.update({
        where: { id: currentUserId },
        data: { followingCount: { decrement: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);

    return { success: true, message: 'User unfollowed successfully' };
  }

  async getFollowers(userId: string, skip = 0, take = 20) {
    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return follows.map((follow) => follow.follower);
  }

  async getFollowing(userId: string, skip = 0, take = 20) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return follows.map((follow) => follow.following);
  }
}
