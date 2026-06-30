import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class FollowDto {
  @IsString()
  username: string;
}

@ApiTags('follows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follows')
export class FollowsController {
  constructor(private follows: FollowsService) {}

  @Post()
  follow(@Body() dto: FollowDto, @CurrentUser() user: { id: string }) {
    return this.follows.follow(user.id, dto.username);
  }

  @Delete(':username')
  unfollow(@Param('username') username: string, @CurrentUser() user: { id: string }) {
    return this.follows.unfollow(user.id, username);
  }
}
