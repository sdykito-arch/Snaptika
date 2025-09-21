import { ObjectType, Field } from '@nestjs/graphql';
import { Post } from '../entities/post.entity';

@ObjectType()
export class PostsResponse {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}
