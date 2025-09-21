import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersArgs } from './dto/users.args';
import { UsersResponse } from './dto/users.response';
import { MutationResponse } from '../common/dto/mutation-response.object';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UsersResponse, { name: 'users' })
  findAll(@Args() args: UsersArgs) {
    return this.usersService.findAll(args);
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(GqlAuthGuard)
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.findOne(id, currentUser.id);
  }

  @Query(() => User, { name: 'userByUsername' })
  @UseGuards(GqlAuthGuard)
  findByUsername(
    @Args('username') username: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.findByUsername(username, currentUser.id);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(id, updateUserInput, currentUser.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  followUser(
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.followUser(userId, currentUser.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  unfollowUser(
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.unfollowUser(userId, currentUser.id);
  }

  @Query(() => [User], { name: 'followers' })
  @UseGuards(GqlAuthGuard)
  getFollowers(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
  ) {
    return this.usersService.getFollowers(userId, skip, take);
  }

  @Query(() => [User], { name: 'following' })
  @UseGuards(GqlAuthGuard)
  getFollowing(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
  ) {
    return this.usersService.getFollowing(userId, skip, take);
  }
}
