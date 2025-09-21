import { Module } from '@nestjs/common';
import { MonetizationService } from './monetization.service';
import { MonetizationResolver } from './monetization.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, RedisModule, NotificationsModule],
  providers: [MonetizationResolver, MonetizationService],
  exports: [MonetizationService],
})
export class MonetizationModule {}
