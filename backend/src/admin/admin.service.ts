import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MonetizationService } from '../monetization/monetization.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReportStatus, ReportReason, NotificationType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private monetizationService: MonetizationService,
    private notificationsService: NotificationsService,
  ) {}

  async getDashboardStats() {
    const [userStats, postStats, revenueStats, reportStats] = await Promise.all([
      this.getUserStats(),
      this.getContentStats(),
      this.monetizationService.getMonetizationStats(),
      this.getReportStats(),
    ]);

    return {
      users: userStats,
      content: postStats,
      monetization: revenueStats,
      reports: reportStats,
    };
  }

  private async getUserStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [total, active, newThisMonth, newThisWeek, newToday, verified] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          lastActive: { gte: thirtyDaysAgo },
          isActive: true,
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: oneDayAgo },
        },
      }),
      this.prisma.user.count({
        where: { verified: true },
      }),
    ]);

    return {
      total,
      active,
      newThisMonth,
      newThisWeek,
      newToday,
      verified,
    };
  }

  private async getContentStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalPosts, postsThisMonth, postsToday, totalStories, storiesThisMonth] = await Promise.all([
      this.prisma.post.count({
        where: { isArchived: false },
      }),
      this.prisma.post.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          isArchived: false,
        },
      }),
      this.prisma.post.count({
        where: {
          createdAt: { gte: oneDayAgo },
          isArchived: false,
        },
      }),
      this.prisma.story.count(),
      this.prisma.story.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      totalPosts,
      postsThisMonth,
      postsToday,
      totalStories,
      storiesThisMonth,
    };
  }

  private async getReportStats() {
    const [totalReports, pendingReports, resolvedReports] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({
        where: { status: ReportStatus.PENDING },
      }),
      this.prisma.report.count({
        where: { status: ReportStatus.RESOLVED },
      }),
    ]);

    return {
      total: totalReports,
      pending: pendingReports,
      resolved: resolvedReports,
    };
  }

  async getUsers(skip = 0, take = 20, search?: string, verified?: boolean) {
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (verified !== undefined) {
      where.verified = verified;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          verified: true,
          monetizationStatus: true,
          followersCount: true,
          postsCount: true,
          createdAt: true,
          lastActive: true,
        },
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

  async updateUser(userId: string, updates: {
    verified?: boolean;
    isActive?: boolean;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    // Send notification if verified
    if (updates.verified && !user.verified) {
      await this.notificationsService.create({
        receiverId: userId,
        type: NotificationType.SYSTEM,
        title: 'Account Verified!',
        message: 'Congratulations! Your account has been verified.',
      });
    }

    return {
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  async getReports(skip = 0, take = 20, status?: ReportStatus, reason?: ReportReason) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (reason) {
      where.reason = reason;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              caption: true,
              mediaUrls: true,
              mediaType: true,
              author: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      total,
      hasMore: skip + take < total,
    };
  }

  async reviewReport(reportId: string, action: 'resolve' | 'dismiss', reason?: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reportedUser: true,
        post: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new ForbiddenException('Report has already been reviewed');
    }

    const status = action === 'resolve' ? ReportStatus.RESOLVED : ReportStatus.DISMISSED;

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        reviewedAt: new Date(),
      },
    });

    // Take action if resolved
    if (action === 'resolve') {
      if (report.reportedUser) {
        // Warn or suspend user based on report reason
        if (report.reason === ReportReason.SPAM || report.reason === ReportReason.HARASSMENT) {
          // Send warning notification
          await this.notificationsService.create({
            receiverId: report.reportedUser.id,
            type: NotificationType.SYSTEM,
            title: 'Content Policy Warning',
            message: `Your content was reported for ${report.reason.toLowerCase()}. Please review our community guidelines.`,
          });
        }
      }

      if (report.post && report.reason === ReportReason.INAPPROPRIATE_CONTENT) {
        // Archive the post
        await this.prisma.post.update({
          where: { id: report.postId },
          data: { isArchived: true },
        });
      }
    }

    return {
      success: true,
      message: `Report ${action}d successfully`,
    };
  }

  async getAnalytics(startDate: Date, endDate: Date) {
    const [userGrowth, contentGrowth, engagementStats] = await Promise.all([
      this.getUserGrowthAnalytics(startDate, endDate),
      this.getContentGrowthAnalytics(startDate, endDate),
      this.getEngagementAnalytics(startDate, endDate),
    ]);

    return {
      userGrowth,
      contentGrowth,
      engagement: engagementStats,
    };
  }

  private async getUserGrowthAnalytics(startDate: Date, endDate: Date) {
    // Group users by day
    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date
    const growthData = users.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(growthData).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private async getContentGrowthAnalytics(startDate: Date, endDate: Date) {
    const [posts, stories] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          isArchived: false,
        },
        select: {
          createdAt: true,
          mediaType: true,
        },
      }),
      this.prisma.story.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const postsByDate = posts.reduce((acc, post) => {
      const date = post.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const storiesByDate = stories.reduce((acc, story) => {
      const date = story.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      posts: Object.entries(postsByDate).map(([date, count]) => ({ date, count })),
      stories: Object.entries(storiesByDate).map(([date, count]) => ({ date, count })),
    };
  }

  private async getEngagementAnalytics(startDate: Date, endDate: Date) {
    const [likes, comments, views] = await Promise.all([
      this.prisma.like.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.comment.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.postView.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    return {
      totalLikes: likes,
      totalComments: comments,
      totalViews: views,
    };
  }
}
