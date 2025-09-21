import { ObjectType, Field, ID } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Story {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  authorId: string;

  @Field()
  mediaUrl: string;

  @Field(() => MediaType)
  mediaType: MediaType;

  @Field({ nullable: true })
  caption?: string;

  @Field({ nullable: true })
  duration?: number;

  @Field()
  viewsCount: number;

  @Field()
  createdAt: Date;

  @Field()
  expiresAt: Date;

  @Field(() => User)
  author: User;

  @Field({ nullable: true })
  isViewed?: boolean;
}
