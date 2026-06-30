import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RetweetsService } from './retweets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsUUID } from 'class-validator';

class RetweetDto {
  @IsUUID()
  tweetId: string;
}

@ApiTags('retweets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('retweets')
export class RetweetsController {
  constructor(private retweets: RetweetsService) {}

  @Post()
  retweet(@Body() dto: RetweetDto, @CurrentUser() user: { id: string }) {
    return this.retweets.retweet(user.id, dto.tweetId);
  }

  @Delete(':tweetId')
  unretweet(@Param('tweetId') tweetId: string, @CurrentUser() user: { id: string }) {
    return this.retweets.unretweet(user.id, tweetId);
  }
}
