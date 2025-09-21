import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

// Register enum for GraphQL
registerEnumType(MediaType, {
  name: 'MediaType',
});

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  authorId: string;

  @Field({ nullable: true })
  caption?: string;

  @Field(() => [String])
  mediaUrls: string[];

  @Field(() => MediaType)
  mediaType: MediaType;

  @Field({ nullable: true })
  duration?: number;

  @Field(() => [String])
  hashtags: string[];

  @Field({ nullable: true })
  location?: string;

  @Field()
  isArchived: boolean;

  @Field()
  likesCount: number;

  @Field()
  commentsCount: number;

  @Field()
  viewsCount: number;

  @Field()
  sharesCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => User)
  author: User;

  // Computed fields
  @Field({ nullable: true })
  isLiked?: boolean;

  @Field({ nullable: true })
  isViewed?: boolean;
}
