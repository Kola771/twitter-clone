import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tweets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tweets')
export class TweetsController {
  constructor(private tweets: TweetsService) {}

  @Post()
  create(@Body() dto: CreateTweetDto, @CurrentUser() user: { id: string }) {
    return this.tweets.create(user.id, dto);
  }

  @Get('feed')
  feed(@CurrentUser() user: { id: string }) {
    return this.tweets.getFeed(user.id);
  }

  @Get('search')
  search(@Query('q') q: string, @CurrentUser() user: { id: string }) {
    return this.tweets.search(q ?? '', user.id);
  }

  @Get('user/:username')
  userTweets(@Param('username') username: string, @CurrentUser() user: { id: string }) {
    return this.tweets.getUserTweets(username, user.id);
  }

  @Get(':id/replies')
  replies(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.tweets.getReplies(id, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.tweets.findOne(id, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.tweets.delete(id, user.id);
  }
}
