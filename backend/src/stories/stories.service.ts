import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateStoryInput } from './dto/create-story.input';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StoriesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(createStoryInput: CreateStoryInput, authorId: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Stories expire after 24 hours

    const story = await this.prisma.story.create({
      data: {
        ...createStoryInput,
        authorId,
        expiresAt,
      },
      include: {
        author: {
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
    });

    // Clear cached stories
    await this.clearStoriesCache();

    return story;
  }

  async findAll(currentUserId?: string, skip = 0, take = 20) {
    const now = new Date();
    
    // Get stories from followed users + own stories
    let authorIds: string[] = [];
    
    if (currentUserId) {
      const followingIds = await this.prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      
      authorIds = [currentUserId, ...followingIds.map(f => f.followingId)];
    }

    const where = {
      expiresAt: { gt: now },
      author: { isActive: true },
      ...(authorIds.length > 0 && { authorId: { in: authorIds } }),
    };

    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({
        where,
        include: {
          author: {
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
      }),
      this.prisma.story.count({ where }),
    ]);

    // Add view status if user is authenticated
    if (currentUserId) {
      const storiesWithStatus = await Promise.all(
        stories.map(async (story) => {
          const isViewed = await this.prisma.storyView.findUnique({
            where: {
              userId_storyId: {
                userId: currentUserId,
                storyId: story.id,
              },
            },
          });

          return {
            ...story,
            isViewed: !!isViewed,
          };
        }),
      );

      return {
        stories: storiesWithStatus,
        total,
        hasMore: skip + take < total,
      };
    }

    return {
      stories,
      total,
      hasMore: skip + take < total,
    };
  }

  async findUserStories(userId: string, currentUserId?: string, skip = 0, take = 20) {
    const now = new Date();
    
    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({
        where: {
          authorId: userId,
          expiresAt: { gt: now },
        },
        include: {
          author: {
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
      }),
      this.prisma.story.count({
        where: {
          authorId: userId,
          expiresAt: { gt: now },
        },
      }),
    ]);

    // Add view status if user is authenticated
    if (currentUserId) {
      const storiesWithStatus = await Promise.all(
        stories.map(async (story) => {
          const isViewed = await this.prisma.storyView.findUnique({
            where: {
              userId_storyId: {
                userId: currentUserId,
                storyId: story.id,
              },
            },
          });

          return {
            ...story,
            isViewed: !!isViewed,
          };
        }),
      );

      return {
        stories: storiesWithStatus,
        total,
        hasMore: skip + take < total,
      };
    }

    return {
      stories,
      total,
      hasMore: skip + take < total,
    };
  }

  async findOne(id: string, currentUserId?: string) {
    const story = await this.prisma.story.findUnique({
      where: { id },
      include: {
        author: {
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
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    // Check if story has expired
    if (new Date() > story.expiresAt) {
      throw new NotFoundException('Story has expired');
    }

    // Add view status if user is authenticated
    if (currentUserId) {
      const isViewed = await this.prisma.storyView.findUnique({
        where: {
          userId_storyId: {
            userId: currentUserId,
            storyId: id,
          },
        },
      });

      return {
        ...story,
        isViewed: !!isViewed,
      };
    }

    return story;
  }

  async remove(id: string, currentUserId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    if (story.authorId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own stories');
    }

    await this.prisma.story.delete({ where: { id } });

    // Clear cached stories
    await this.clearStoriesCache();

    return { success: true, message: 'Story deleted successfully' };
  }

  async viewStory(storyId: string, userId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    // Check if story has expired
    if (new Date() > story.expiresAt) {
      throw new NotFoundException('Story has expired');
    }

    // Check if already viewed
    const existingView = await this.prisma.storyView.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
    });

    if (!existingView) {
      await this.prisma.$transaction([
        this.prisma.storyView.create({
          data: {
            userId,
            storyId,
          },
        }),
        this.prisma.story.update({
          where: { id: storyId },
          data: { viewsCount: { increment: 1 } },
        }),
      ]);
    }

    return { success: true, message: 'Story view recorded' };
  }

  async getStoryViewers(storyId: string, authorId: string, skip = 0, take = 20) {
    // Check if user owns the story
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story || story.authorId !== authorId) {
      throw new ForbiddenException('You can only view your own story viewers');
    }

    const views = await this.prisma.storyView.findMany({
      where: { storyId },
      include: {
        user: {
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

    return views.map(view => ({
      ...view.user,
      viewedAt: view.createdAt,
    }));
  }

  private async clearStoriesCache() {
    // Clear stories cache (implement based on your caching strategy)
    await this.redis.del('stories:*');
  }

  // Clean up expired stories every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredStories() {
    const now = new Date();
    
    const deletedCount = await this.prisma.story.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    if (deletedCount.count > 0) {
      console.log(`Cleaned up ${deletedCount.count} expired stories`);
      await this.clearStoriesCache();
    }
  }
}
