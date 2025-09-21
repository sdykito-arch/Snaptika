import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MonetizationStatus, MonetizationRequestStatus, NotificationType } from '@prisma/client';

@Injectable()
export class MonetizationService {
  private readonly MIN_FOLLOWERS: number;
  private readonly MIN_VIEWS: number;
  private readonly PERIOD_DAYS: number;
  private readonly MIN_VIDEO_DURATION: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.MIN_FOLLOWERS = parseInt(this.configService.get('MIN_FOLLOWERS_FOR_MONETIZATION') || '5000');
    this.MIN_VIEWS = parseInt(this.configService.get('MIN_VIEWS_FOR_MONETIZATION') || '100000');
    this.PERIOD_DAYS = parseInt(this.configService.get('MONETIZATION_PERIOD_DAYS') || '30');
    this.MIN_VIDEO_DURATION = parseInt(this.configService.get('MIN_VIDEO_DURATION_FOR_VIEWS') || '180');
  }

  async checkEligibility(userId: string): Promise<{
    eligible: boolean;
    followersCount: number;
    viewsCount: number;
    requirements: {
      minFollowers: number;
      minViews: number;
      periodDays: number;
      minVideoDuration: number;
    };
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get views count for videos >= 3 minutes in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - this.PERIOD_DAYS);

    const viewsCount = await this.prisma.postView.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        post: {
          authorId: userId,
          mediaType: 'VIDEO',
          duration: {
            gte: this.MIN_VIDEO_DURATION,
          },
        },
      },
    });

    const eligible = user.followersCount >= this.MIN_FOLLOWERS && viewsCount >= this.MIN_VIEWS;

    return {
      eligible,
      followersCount: user.followersCount,
      viewsCount,
      requirements: {
        minFollowers: this.MIN_FOLLOWERS,
        minViews: this.MIN_VIEWS,
        periodDays: this.PERIOD_DAYS,
        minVideoDuration: this.MIN_VIDEO_DURATION,
      },
    };
  }

  async requestMonetization(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.monetizationStatus === MonetizationStatus.APPROVED) {
      throw new ForbiddenException('User is already approved for monetization');
    }

    if (user.monetizationStatus === MonetizationStatus.REQUESTED) {
      throw new ForbiddenException('Monetization request is already pending');
    }

    // Check eligibility
    const eligibility = await this.checkEligibility(userId);
    
    if (!eligibility.eligible) {
      throw new ForbiddenException(
        `User does not meet monetization requirements. ` +
        `Needs ${this.MIN_FOLLOWERS} followers (has ${eligibility.followersCount}) and ` +
        `${this.MIN_VIEWS} views in ${this.PERIOD_DAYS} days (has ${eligibility.viewsCount})`,
      );
    }

    // Create monetization request
    const request = await this.prisma.monetizationRequest.create({
      data: {
        userId,
        followersCount: eligibility.followersCount,
        viewsCount: eligibility.viewsCount,
      },
    });

    // Update user status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        monetizationStatus: MonetizationStatus.REQUESTED,
        monetizationRequestedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Monetization request submitted successfully',
      requestId: request.id,
    };
  }

  async getMonetizationRequests(skip = 0, take = 20, status?: MonetizationRequestStatus) {
    const where = status ? { status } : {};

    const [requests, total] = await Promise.all([
      this.prisma.monetizationRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              verified: true,
              followersCount: true,
              postsCount: true,
              createdAt: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.monetizationRequest.count({ where }),
    ]);

    return {
      requests,
      total,
      hasMore: skip + take < total,
    };
  }

  async reviewMonetizationRequest(
    requestId: string,
    approve: boolean,
    reason?: string,
  ) {
    const request = await this.prisma.monetizationRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Monetization request not found');
    }

    if (request.status !== MonetizationRequestStatus.PENDING) {
      throw new ForbiddenException('Request has already been reviewed');
    }

    const status = approve ? MonetizationRequestStatus.APPROVED : MonetizationRequestStatus.REJECTED;
    const userStatus = approve ? MonetizationStatus.APPROVED : MonetizationStatus.REJECTED;

    await this.prisma.$transaction([
      // Update request
      this.prisma.monetizationRequest.update({
        where: { id: requestId },
        data: {
          status,
          reason,
          reviewedAt: new Date(),
        },
      }),
      // Update user
      this.prisma.user.update({
        where: { id: request.userId },
        data: {
          monetizationStatus: userStatus,
          monetizationApprovedAt: approve ? new Date() : null,
        },
      }),
    ]);

    // Send notification
    await this.notificationsService.create({
      receiverId: request.userId,
      type: approve ? NotificationType.MONETIZATION_APPROVED : NotificationType.MONETIZATION_REJECTED,
      title: approve ? 'Monetization Approved!' : 'Monetization Request Rejected',
      message: approve
        ? 'Congratulations! Your monetization request has been approved. You can now earn revenue from your content.'
        : `Your monetization request has been rejected. ${reason || 'Please review the requirements and try again.'}`,
    });

    return {
      success: true,
      message: `Monetization request ${approve ? 'approved' : 'rejected'} successfully`,
    };
  }

  async getAdRevenue(userId: string, period?: string) {
    const where: any = { userId };
    
    if (period) {
      where.period = period;
    }

    const revenues = await this.prisma.adRevenue.findMany({
      where,
      orderBy: { period: 'desc' },
    });

    const totalAmount = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    const totalImpressions = revenues.reduce((sum, revenue) => sum + revenue.impressions, 0);
    const totalClicks = revenues.reduce((sum, revenue) => sum + revenue.clicks, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      revenues,
      totalAmount,
      totalImpressions,
      totalClicks,
      averageCTR,
    };
  }

  async createAdRevenue(data: {
    userId: string;
    amount: number;
    period: string;
    impressions: number;
    clicks: number;
    cpm: number;
    ctr: number;
  }) {
    return this.prisma.adRevenue.create({
      data,
    });
  }

  async getMonetizationStats() {
    const [totalRequests, pendingRequests, approvedUsers, totalRevenue] = await Promise.all([
      this.prisma.monetizationRequest.count(),
      this.prisma.monetizationRequest.count({
        where: { status: MonetizationRequestStatus.PENDING },
      }),
      this.prisma.user.count({
        where: { monetizationStatus: MonetizationStatus.APPROVED },
      }),
      this.prisma.adRevenue.aggregate({
        _sum: { amount: true },
      }),
    ]);

    const approvalRate = totalRequests > 0
      ? ((totalRequests - pendingRequests) / totalRequests) * 100
      : 0;

    return {
      totalRequests,
      pendingRequests,
      approvedUsers,
      totalRevenue: Number(totalRevenue._sum.amount) || 0,
      approvalRate,
    };
  }

  // Check eligibility automatically every day
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateEligibilityStatus() {
    console.log('Checking monetization eligibility for all users...');
    
    const users = await this.prisma.user.findMany({
      where: {
        monetizationStatus: MonetizationStatus.NOT_ELIGIBLE,
        isActive: true,
      },
    });

    for (const user of users) {
      try {
        const eligibility = await this.checkEligibility(user.id);
        
        if (eligibility.eligible) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { monetizationStatus: MonetizationStatus.ELIGIBLE },
          });

          // Send notification about eligibility
          await this.notificationsService.create({
            receiverId: user.id,
            type: NotificationType.SYSTEM,
            title: 'You\'re Eligible for Monetization!',
            message: 'Congratulations! You now meet the requirements for monetization. Submit your request to start earning revenue.',
          });
        }
      } catch (error) {
        console.error(`Error checking eligibility for user ${user.id}:`, error);
      }
    }
  }

  // Generate monthly ad revenue (mock implementation)
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlyRevenue() {
    console.log('Generating monthly ad revenue...');
    
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const period = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const approvedUsers = await this.prisma.user.findMany({
      where: {
        monetizationStatus: MonetizationStatus.APPROVED,
        isActive: true,
      },
    });

    for (const user of approvedUsers) {
      try {
        // Calculate views and engagement for the user in the last month
        const monthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const monthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

        const views = await this.prisma.postView.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
            post: {
              authorId: user.id,
            },
          },
        });

        if (views > 0) {
          // Mock revenue calculation
          const impressions = Math.floor(views * 0.8); // 80% of views become impressions
          const ctr = 0.02 + Math.random() * 0.03; // 2-5% CTR
          const clicks = Math.floor(impressions * ctr);
          const cpm = 1.5 + Math.random() * 2.5; // $1.5-$4 CPM
          const amount = (impressions / 1000) * cpm;

          await this.createAdRevenue({
            userId: user.id,
            amount,
            period,
            impressions,
            clicks,
            cpm,
            ctr: ctr * 100,
          });
        }
      } catch (error) {
        console.error(`Error generating revenue for user ${user.id}:`, error);
      }
    }
  }
}
