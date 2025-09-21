import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserStats {
  @Field()
  total: number;

  @Field()
  active: number;

  @Field()
  newThisMonth: number;

  @Field()
  newThisWeek: number;

  @Field()
  newToday: number;

  @Field()
  verified: number;
}

@ObjectType()
export class ContentStats {
  @Field()
  totalPosts: number;

  @Field()
  postsThisMonth: number;

  @Field()
  postsToday: number;

  @Field()
  totalStories: number;

  @Field()
  storiesThisMonth: number;
}

@ObjectType()
export class ReportStats {
  @Field()
  total: number;

  @Field()
  pending: number;

  @Field()
  resolved: number;
}

@ObjectType()
export class DashboardStats {
  @Field(() => UserStats)
  users: UserStats;

  @Field(() => ContentStats)
  content: ContentStats;

  @Field(() => ReportStats)
  reports: ReportStats;
}
