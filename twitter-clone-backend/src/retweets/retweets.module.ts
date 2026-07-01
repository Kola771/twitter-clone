import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RetweetsService } from './retweets.service';
import { RetweetsController } from './retweets.controller';

@Module({
  imports: [NotificationsModule],
  providers: [RetweetsService],
  controllers: [RetweetsController],
})
export class RetweetsModule {}
