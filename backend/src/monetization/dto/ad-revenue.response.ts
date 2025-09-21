import { ObjectType, Field } from '@nestjs/graphql';
import { AdRevenue } from '../entities/ad-revenue.entity';

@ObjectType()
export class AdRevenueResponse {
  @Field(() => [AdRevenue])
  revenues: AdRevenue[];

  @Field()
  totalAmount: number;

  @Field()
  totalImpressions: number;

  @Field()
  totalClicks: number;

  @Field()
  averageCTR: number;
}
