import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AdRevenue {
  @Field()
  id: string;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field()
  period: string;

  @Field()
  impressions: number;

  @Field()
  clicks: number;

  @Field()
  cpm: number;

  @Field()
  ctr: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  paidAt?: Date;
}
