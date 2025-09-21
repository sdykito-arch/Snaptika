import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { PresignedUrlInput } from './dto/presigned-url.input';
import { PresignedUrlResponse } from './dto/presigned-url.response';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver()
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Mutation(() => PresignedUrlResponse)
  @UseGuards(GqlAuthGuard)
  async getPresignedUrl(
    @Args('input') input: PresignedUrlInput,
  ): Promise<PresignedUrlResponse> {
    const { uploadUrl, fileUrl } = await this.mediaService.getPresignedUrl(
      input.fileName,
      input.fileType,
      input.folder,
    );

    return { uploadUrl, fileUrl };
  }
}
