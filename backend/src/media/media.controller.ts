import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = await this.mediaService.uploadFile(file, 'posts');
    return { url };
  }

  @Post('upload-multiple')
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = await this.mediaService.uploadMultipleFiles(files, 'posts');
    return { urls };
  }

  @Post('upload-avatar')
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate image file
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const url = await this.mediaService.uploadFile(file, 'avatars');
    return { url };
  }

  @Post('upload-video')
  @UseGuards(GqlAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate video file
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Only video files are allowed');
    }

    // Process video (compress, resize, etc.)
    const processedBuffer = await this.mediaService.processVideo(file);
    
    // Create processed file object
    const processedFile = {
      ...file,
      buffer: processedBuffer,
      originalname: file.originalname.replace(/\.[^/.]+$/, '.mp4'),
      mimetype: 'video/mp4',
    };

    // Generate thumbnail
    const thumbnailBuffer = await this.mediaService.generateThumbnail(file);
    const thumbnailFile = {
      buffer: thumbnailBuffer,
      originalname: file.originalname.replace(/\.[^/.]+$/, '_thumb.png'),
      mimetype: 'image/png',
    } as Express.Multer.File;

    // Upload both video and thumbnail
    const [videoUrl, thumbnailUrl] = await Promise.all([
      this.mediaService.uploadFile(processedFile, 'videos'),
      this.mediaService.uploadFile(thumbnailFile, 'thumbnails'),
    ]);

    return { videoUrl, thumbnailUrl };
  }

  @Post('presigned-url')
  @UseGuards(GqlAuthGuard)
  async getPresignedUrl(
    @Query('fileName') fileName: string,
    @Query('fileType') fileType: string,
    @Query('folder') folder?: string,
  ) {
    if (!fileName || !fileType) {
      throw new BadRequestException('fileName and fileType are required');
    }

    return this.mediaService.getPresignedUrl(fileName, fileType, folder);
  }
}
