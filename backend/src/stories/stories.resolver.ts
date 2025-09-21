import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { Story } from './entities/story.entity';
import { CreateStoryInput } from './dto/create-story.input';
import { StoriesResponse } from './dto/stories.response';
import { StoryViewer } from './dto/story-viewer.response';
import { MutationResponse } from '../common/dto/mutation-response.object';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Story)
export class StoriesResolver {
  constructor(private readonly storiesService: StoriesService) {}

  @Mutation(() => Story)
  @UseGuards(GqlAuthGuard)
  createStory(
    @Args('createStoryInput') createStoryInput: CreateStoryInput,
    @CurrentUser() user: User,
  ) {
    return this.storiesService.create(createStoryInput, user.id);
  }

  @Query(() => StoriesResponse, { name: 'stories' })
  findAll(
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
    @CurrentUser() user?: User,
  ) {
    return this.storiesService.findAll(user?.id, skip, take);
  }

  @Query(() => StoriesResponse, { name: 'userStories' })
  findUserStories(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
    @CurrentUser() user?: User,
  ) {
    return this.storiesService.findUserStories(userId, user?.id, skip, take);
  }

  @Query(() => Story, { name: 'story' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user?: User,
  ) {
    return this.storiesService.findOne(id, user?.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  removeStory(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.storiesService.remove(id, user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(GqlAuthGuard)
  viewStory(
    @Args('storyId', { type: () => ID }) storyId: string,
    @CurrentUser() user: User,
  ) {
    return this.storiesService.viewStory(storyId, user.id);
  }

  @Query(() => [StoryViewer], { name: 'storyViewers' })
  @UseGuards(GqlAuthGuard)
  getStoryViewers(
    @Args('storyId', { type: () => ID }) storyId: string,
    @Args('skip', { type: () => Number, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, defaultValue: 20 }) take: number,
    @CurrentUser() user: User,
  ) {
    return this.storiesService.getStoryViewers(storyId, user.id, skip, take);
  }
}
