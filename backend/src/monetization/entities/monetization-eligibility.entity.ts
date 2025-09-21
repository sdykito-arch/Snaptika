import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class MonetizationRequirements {
  @Field()
  minFollowers: number;

  @Field()
  minViews: number;

  @Field()
  periodDays: number;

  @Field()
  minVideoDuration: number;
}

@ObjectType()
export class MonetizationEligibility {
  @Field()
  eligible: boolean;

  @Field()
  followersCount: number;

  @Field()
  viewsCount: number;

  @Field(() => MonetizationRequirements)
  requirements: MonetizationRequirements;
}
