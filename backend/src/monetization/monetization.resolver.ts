import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MonetizationService } from './monetization.service';
import { MonetizationEligibility } from './entities/monetization-eligibility.entity';
import { MonetizationRequest } from './entities/monetization-request.entity';
import { MonetizationRequestsResponse } from './dto/monetization-requests.response';
import { AdRevenueResponse } from './dto/ad-revenue.response';
import { MonetizationStats } from './dto/monetization-stats.response';
import { ReviewMonetizationInput } from './dto/review-monetization.input';
import { MutationResponse } from '../common/dto/mutation-response.object';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver()
export class MonetizationResolver {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Query(() => MonetizationEligibility)
  @UseGuards(GqlAuthGuard)
  async checkMonetizationEligibility(
    @CurrentUser() user: User,
  ): Promise<MonetizationEligibility> {
    return this.monetizationService.checkEligibility(user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  async requestMonetization(
    @CurrentUser() user: User,
  ): Promise<MutationResponse> {
    return this.monetizationService.requestMonetization(user.id);
  }

  @Query(() => MonetizationRequestsResponse)
  @UseGuards(GqlAuthGuard)
  async getMonetizationRequests(
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
    @Args('status', { nullable: true }) status?: string,
  ): Promise<MonetizationRequestsResponse> {
    return this.monetizationService.getMonetizationRequests(skip, take, status as any);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  async reviewMonetizationRequest(
    @Args('input') input: ReviewMonetizationInput,
  ): Promise<MutationResponse> {
    return this.monetizationService.reviewMonetizationRequest(
      input.requestId,
      input.approve,
      input.reason,
    );
  }

  @Query(() => AdRevenueResponse)
  @UseGuards(GqlAuthGuard)
  async getAdRevenue(
    @CurrentUser() user: User,
    @Args('period', { nullable: true }) period?: string,
  ): Promise<AdRevenueResponse> {
    return this.monetizationService.getAdRevenue(user.id, period);
  }

  @Query(() => MonetizationStats)
  @UseGuards(GqlAuthGuard)
  async getMonetizationStats(): Promise<MonetizationStats> {
    return this.monetizationService.getMonetizationStats();
  }
}
