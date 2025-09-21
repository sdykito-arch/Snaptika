import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class MutationResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
