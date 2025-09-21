import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { MonetizationRequestStatus } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

// Register enum for GraphQL
registerEnumType(MonetizationRequestStatus, {
  name: 'MonetizationRequestStatus',
});

@ObjectType()
export class MonetizationRequest {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => MonetizationRequestStatus)
  status: MonetizationRequestStatus;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  followersCount: number;

  @Field()
  viewsCount: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field(() => User)
  user: User;
}
