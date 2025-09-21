import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { NotificationType } from '@prisma/client';
import { User } from '../../users/entities/user.entity';
import { GraphQLJSON } from 'graphql-type-json';

// Register enum for GraphQL
registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  senderId?: string;

  @Field(() => ID)
  receiverId: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: any;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;

  @Field(() => User, { nullable: true })
  sender?: User;
}
