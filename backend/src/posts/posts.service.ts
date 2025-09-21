import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PostsArgs } from './dto/posts.args';
import { MediaType } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(createPostInput: CreatePostInput, authorId: string) {
    const post = await this.prisma.post.create({
      data: {
        ...createPostInput,
        authorId,
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

    // Update user's post count
    await this.prisma.user.update({
      where: { id: authorId },
      data: { postsCount: { increment: 1 } },
    });

    // Clear cached feeds
    await this.clearUserFeeds(authorId);

    return post;
  }

  async findAll(args: PostsArgs, currentUserId?: string) {
    const { skip = 0, take = 20, hashtag, userId } = args;

    const where: any = {
      isArchived: false,
      author: {
        isActive: true,
      },
    };

    if (hashtag) {
      where.hashtags = {
        has: hashtag,
      };
    }

    if (userId) {
      where.authorId = userId;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
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
      this.prisma.post.count({ where }),
    ]);

    // Add like and view status if user is authenticated
    if (currentUserId) {
      const postsWithStatus = await Promise.all(
        posts.map(async (post) => {
          const [isLiked, isViewed] = await Promise.all([
            this.prisma.like.findUnique({
              where: {
                userId_postId: {
                  userId: currentUserId,
                  postId: post.id,
                },
              },
            }),
            this.prisma.postView.findUnique({
              where: {
                userId_postId: {
                  userId: currentUserId,
                  postId: post.id,
                },
              },
            }),
          ]);

          return {
            ...post,
            isLiked: !!isLiked,
            isViewed: !!isViewed,
          };
        }),
      );

      return {
        posts: postsWithStatus,
        total,
        hasMore: skip + take < total,
      };
    }

    return {
      posts,
      total,
      hasMore: skip + take < total,
    };
  }

  async findOne(id: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
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

    if (!post || post.isArchived) {
      throw new NotFoundException('Post not found');
    }

    // Add like and view status if user is authenticated
    if (currentUserId) {
      const [isLiked, isViewed] = await Promise.all([
        this.prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: currentUserId,
              postId: id,
            },
          },
        }),
        this.prisma.postView.findUnique({
          where: {
            userId_postId: {
              userId: currentUserId,
              postId: id,
            },
          },
        }),
      ]);

      return {
        ...post,
        isLiked: !!isLiked,
        isViewed: !!isViewed,
      };
    }

    return post;
  }

  async update(id: string, updatePostInput: UpdatePostInput, currentUserId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostInput,
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
  }

  async remove(id: string, currentUserId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.$transaction([
      this.prisma.post.delete({ where: { id } }),
      this.prisma.user.update({
        where: { id: currentUserId },
        data: { postsCount: { decrement: 1 } },
      }),
    ]);

    return { success: true, message: 'Post deleted successfully' };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.isArchived) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      throw new ForbiddenException('Post already liked');
    }

    await this.prisma.$transaction([
      this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    return { success: true, message: 'Post liked successfully' };
  }

  async unlikePost(postId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.$transaction([
      this.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    return { success: true, message: 'Post unliked successfully' };
  }

  async viewPost(postId: string, userId: string, duration: number = 0) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.isArchived) {
      throw new NotFoundException('Post not found');
    }

    // Check if already viewed
    const existingView = await this.prisma.postView.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!existingView) {
      await this.prisma.$transaction([
        this.prisma.postView.create({
          data: {
            userId,
            postId,
            duration,
          },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { viewsCount: { increment: 1 } },
        }),
      ]);
    } else {
      // Update duration if it's longer
      if (duration > existingView.duration) {
        await this.prisma.postView.update({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
          data: { duration },
        });
      }
    }

    return { success: true, message: 'Post view recorded' };
  }

  async getFeed(userId: string, skip = 0, take = 20) {
    // Check cache first
    const cachedFeed = await this.redis.getCachedFeed(userId);
    if (cachedFeed && skip === 0) {
      return {
        posts: cachedFeed.slice(0, take),
        total: cachedFeed.length,
        hasMore: take < cachedFeed.length,
      };
    }

    // Get posts from followed users + trending posts
    const followingIds = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingUserIds = followingIds.map((f) => f.followingId);

    const [feedPosts, trendingPosts] = await Promise.all([
      // Posts from followed users
      this.prisma.post.findMany({
        where: {
          authorId: { in: followingUserIds },
          isArchived: false,
          author: { isActive: true },
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
        orderBy: { createdAt: 'desc' },
        take: take * 2, // Get more to mix with trending
      }),
      // Trending posts (not from followed users)
      this.prisma.post.findMany({
        where: {
          authorId: { notIn: [...followingUserIds, userId] },
          isArchived: false,
          author: { isActive: true },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
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
        orderBy: [
          { likesCount: 'desc' },
          { viewsCount: 'desc' },
          { createdAt: 'desc' },
        ],
        take: Math.floor(take / 2),
      }),
    ]);

    // Mix feed and trending posts
    const mixedPosts = [...feedPosts, ...trendingPosts]
      .sort((a, b) => {
        // Prioritize followed users' recent posts
        if (followingUserIds.includes(a.authorId) && !followingUserIds.includes(b.authorId)) {
          return -1;
        }
        if (!followingUserIds.includes(a.authorId) && followingUserIds.includes(b.authorId)) {
          return 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(skip, skip + take);

    // Add like and view status
    const postsWithStatus = await Promise.all(
      mixedPosts.map(async (post) => {
        const [isLiked, isViewed] = await Promise.all([
          this.prisma.like.findUnique({
            where: {
              userId_postId: {
                userId,
                postId: post.id,
              },
            },
          }),
          this.prisma.postView.findUnique({
            where: {
              userId_postId: {
                userId,
                postId: post.id,
              },
            },
          }),
        ]);

        return {
          ...post,
          isLiked: !!isLiked,
          isViewed: !!isViewed,
        };
      }),
    );

    // Cache the feed
    if (skip === 0) {
      await this.redis.cacheFeed(userId, postsWithStatus);
    }

    return {
      posts: postsWithStatus,
      total: feedPosts.length + trendingPosts.length,
      hasMore: skip + take < feedPosts.length + trendingPosts.length,
    };
  }

  private async clearUserFeeds(userId: string) {
    // Clear cache for user and their followers
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });

    const userIds = [userId, ...followers.map((f) => f.followerId)];
    
    // Clear cached feeds
    await Promise.all(
      userIds.map((id) => this.redis.del(`feed:${id}`)),
    );
  }
}
