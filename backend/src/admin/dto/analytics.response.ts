import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DataPoint {
  @Field()
  date: string;

  @Field()
  count: number;
}

@ObjectType()
export class UserGrowthData {
  @Field(() => [DataPoint])
  data: DataPoint[];
}

@ObjectType()
export class ContentGrowthData {
  @Field(() => [DataPoint])
  posts: DataPoint[];

  @Field(() => [DataPoint])
  stories: DataPoint[];
}

@ObjectType()
export class EngagementData {
  @Field()
  totalLikes: number;

  @Field()
  totalComments: number;

  @Field()
  totalViews: number;
}

@ObjectType()
export class AnalyticsResponse {
  @Field(() => UserGrowthData)
  userGrowth: UserGrowthData;

  @Field(() => ContentGrowthData)
  contentGrowth: ContentGrowthData;

  @Field(() => EngagementData)
  engagement: EngagementData;
}
