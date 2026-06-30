import { Module } from '@nestjs/common';
import { RetweetsService } from './retweets.service';
import { RetweetsController } from './retweets.controller';

@Module({ providers: [RetweetsService], controllers: [RetweetsController] })
export class RetweetsModule {}
