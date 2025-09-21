import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class MonetizationStats {
  @Field()
  totalRequests: number;

  @Field()
  pendingRequests: number;

  @Field()
  approvedUsers: number;

  @Field()
  totalRevenue: number;

  @Field()
  approvalRate: number;
}
