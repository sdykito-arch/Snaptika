import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class UsersResponse {
  @Field(() => [User])
  users: User[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}
