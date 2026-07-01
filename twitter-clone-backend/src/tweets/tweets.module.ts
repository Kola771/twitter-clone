import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { TweetsService } from './tweets.service';
import { TweetsController } from './tweets.controller';

@Module({
  imports: [NotificationsModule],
  providers: [TweetsService],
  controllers: [TweetsController],
})
export class TweetsModule {}
