import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class StoryViewer {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  verified: boolean;

  @Field()
  viewedAt: Date;
}
