import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationsResponse } from './dto/notifications.response';
import { MutationResponse } from '../common/dto/mutation-response.object';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => NotificationsResponse, { name: 'notifications' })
  @UseGuards(GqlAuthGuard)
  findAll(
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.findAll(user.id, skip, take);
  }

  @Query(() => Number, { name: 'unreadNotificationsCount' })
  @UseGuards(GqlAuthGuard)
  getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  markNotificationAsRead(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  markAllNotificationsAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
