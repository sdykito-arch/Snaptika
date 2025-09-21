import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PostsArgs } from './dto/posts.args';
import { PostsResponse } from './dto/posts.response';
import { ViewPostInput } from './dto/view-post.input';
import { MutationResponse } from '../common/dto/mutation-response.object';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    return this.postsService.create(createPostInput, user.id);
  }

  @Query(() => PostsResponse, { name: 'posts' })
  findAll(
    @Args() args: PostsArgs,
    @CurrentUser() user?: User,
  ) {
    return this.postsService.findAll(args, user?.id);
  }

  @Query(() => Post, { name: 'post' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user?: User,
  ) {
    return this.postsService.findOne(id, user?.id);
  }

  @Query(() => PostsResponse, { name: 'feed' })
  @UseGuards(GqlAuthGuard)
  getFeed(
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
    @CurrentUser() user: User,
  ) {
    return this.postsService.getFeed(user.id, skip, take);
  }

  @Mutation(() => Post)
  @UseGuards(GqlAuthGuard)
  updatePost(
    @Args('id', { type: () => ID }) id: string,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(id, updatePostInput, user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  removePost(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.remove(id, user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  likePost(
    @Args('postId', { type: () => ID }) postId: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.likePost(postId, user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  unlikePost(
    @Args('postId', { type: () => ID }) postId: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.unlikePost(postId, user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  viewPost(
    @Args('viewPostInput') viewPostInput: ViewPostInput,
    @CurrentUser() user: User,
  ) {
    return this.postsService.viewPost(
      viewPostInput.postId,
      user.id,
      viewPostInput.duration,
    );
  }
}
