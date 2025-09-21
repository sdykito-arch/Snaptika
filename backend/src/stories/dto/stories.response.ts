import { ObjectType, Field } from '@nestjs/graphql';
import { Story } from '../entities/story.entity';

@ObjectType()
export class StoriesResponse {
  @Field(() => [Story])
  stories: Story[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}
