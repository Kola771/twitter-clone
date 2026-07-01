import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';

@Module({
  imports: [NotificationsModule],
  providers: [FollowsService],
  controllers: [FollowsController],
})
export class FollowsModule {}
