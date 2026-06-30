import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsUUID } from 'class-validator';

class LikeDto {
  @IsUUID()
  tweetId: string;
}

@ApiTags('likes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('likes')
export class LikesController {
  constructor(private likes: LikesService) {}

  @Post()
  like(@Body() dto: LikeDto, @CurrentUser() user: { id: string }) {
    return this.likes.like(user.id, dto.tweetId);
  }

  @Delete(':tweetId')
  unlike(@Param('tweetId') tweetId: string, @CurrentUser() user: { id: string }) {
    return this.likes.unlike(user.id, tweetId);
  }
}
