import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { MonetizationStatus } from '@prisma/client';

// Register enum for GraphQL
registerEnumType(MonetizationStatus, {
  name: 'MonetizationStatus',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  verified: boolean;

  @Field()
  isPrivate: boolean;

  @Field()
  isActive: boolean;

  @Field(() => MonetizationStatus)
  monetizationStatus: MonetizationStatus;

  @Field({ nullable: true })
  monetizationRequestedAt?: Date;

  @Field({ nullable: true })
  monetizationApprovedAt?: Date;

  @Field({ nullable: true })
  dateOfBirth?: Date;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  followersCount: number;

  @Field()
  followingCount: number;

  @Field()
  postsCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  lastActive: Date;

  // Additional computed fields
  @Field({ nullable: true })
  isFollowing?: boolean;

  @Field({ nullable: true })
  isFollowedBy?: boolean;
}
