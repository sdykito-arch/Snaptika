import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardStats } from './dto/dashboard-stats.response';
import { UsersResponse } from '../users/dto/users.response';
import { ReportsResponse } from './dto/reports.response';
import { AnalyticsResponse } from './dto/analytics.response';
import { UpdateUserInput } from './dto/update-user.input';
import { ReviewReportInput } from './dto/review-report.input';
import { MutationResponse } from '../common/dto/mutation-response.object';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver()
@UseGuards(GqlAuthGuard, AdminGuard)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => DashboardStats)
  async getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }

  @Query(() => UsersResponse)
  async getUsers(
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
    @Args('search', { nullable: true }) search?: string,
    @Args('verified', { nullable: true }) verified?: boolean,
  ): Promise<UsersResponse> {
    return this.adminService.getUsers(skip, take, search, verified);
  }

  @Mutation(() => MutationResponse)
  async updateUser(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<MutationResponse> {
    return this.adminService.updateUser(userId, input);
  }

  @Query(() => ReportsResponse)
  async getReports(
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
    @Args('status', { nullable: true }) status?: string,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<ReportsResponse> {
    return this.adminService.getReports(skip, take, status as any, reason as any);
  }

  @Mutation(() => MutationResponse)
  async reviewReport(
    @Args('input') input: ReviewReportInput,
  ): Promise<MutationResponse> {
    return this.adminService.reviewReport(
      input.reportId,
      input.action,
      input.reason,
    );
  }

  @Query(() => AnalyticsResponse)
  async getAnalytics(
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
  ): Promise<AnalyticsResponse> {
    return this.adminService.getAnalytics(startDate, endDate);
  }
}
