import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesResolver } from './stories.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [PrismaModule, RedisModule, MediaModule],
  providers: [StoriesResolver, StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
