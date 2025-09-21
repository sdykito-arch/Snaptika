import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { MonetizationModule } from '../monetization/monetization.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, RedisModule, MonetizationModule, NotificationsModule],
  providers: [AdminResolver, AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
