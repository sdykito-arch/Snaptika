import { ObjectType, Field } from '@nestjs/graphql';
import { Notification } from '../entities/notification.entity';

@ObjectType()
export class NotificationsResponse {
  @Field(() => [Notification])
  notifications: Notification[];

  @Field()
  total: number;

  @Field()
  unreadCount: number;

  @Field()
  hasMore: boolean;
}
