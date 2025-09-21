import { ObjectType, Field } from '@nestjs/graphql';
import { MonetizationRequest } from '../entities/monetization-request.entity';

@ObjectType()
export class MonetizationRequestsResponse {
  @Field(() => [MonetizationRequest])
  requests: MonetizationRequest[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}
