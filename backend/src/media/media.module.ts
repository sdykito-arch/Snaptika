import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaResolver } from './media.resolver';

@Module({
  providers: [MediaService, MediaResolver],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
