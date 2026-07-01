import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, UpdateProfileDto } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Patch('me')
  updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: { id: string }) {
    return this.users.updateProfile(user.id, dto);
  }

  @Get('search')
  search(@Query('q') q: string, @CurrentUser() user: { id: string }) {
    return this.users.search(q ?? '', user.id);
  }

  @Get('suggestions')
  suggestions(@CurrentUser() user: { id: string }) {
    return this.users.getSuggestions(user.id);
  }

  @Get(':username/followers')
  followers(@Param('username') username: string, @CurrentUser() user: { id: string }) {
    return this.users.getFollowers(username, user.id);
  }

  @Get(':username/following')
  following(@Param('username') username: string, @CurrentUser() user: { id: string }) {
    return this.users.getFollowing(username, user.id);
  }

  @Get(':username')
  findOne(@Param('username') username: string, @CurrentUser() user: { id: string }) {
    return this.users.findByUsername(username, user.id);
  }
}
