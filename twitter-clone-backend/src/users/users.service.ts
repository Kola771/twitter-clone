import { Injectable, NotFoundException } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50) name?: string;
  @IsOptional() @IsString() @MaxLength(160) bio?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() bannerUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private userSelect(currentUserId?: string) {
    return {
      id: true,
      username: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,
      createdAt: true,
      _count: { select: { followers: true, following: true, tweets: true } },
      ...(currentUserId
        ? {
            followers: {
              where: { followerId: currentUserId },
              select: { id: true },
            },
          }
        : {}),
    } as const;
  }

  private format(user: Record<string, unknown>, currentUserId?: string) {
    const { _count, followers, ...rest } = user as {
      _count: { followers: number; following: number; tweets: number };
      followers?: { id: string }[];
      [key: string]: unknown;
    };
    return {
      ...rest,
      followersCount: _count.followers,
      followingCount: _count.following,
      tweetsCount: _count.tweets,
      isFollowing: currentUserId ? (followers as { id: string }[])?.length > 0 : false,
    };
  }

  async findByUsername(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: this.userSelect(currentUserId) as object,
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.format(user as Record<string, unknown>, currentUserId);
  }

  async search(q: string, currentUserId?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: this.userSelect(currentUserId) as object,
      take: 20,
    });
    return users.map((u) => this.format(u as Record<string, unknown>, currentUserId));
  }

  async getSuggestions(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const excludeIds = [userId, ...following.map((f) => f.followingId)];

    const users = await this.prisma.user.findMany({
      where: { id: { notIn: excludeIds } },
      select: this.userSelect(userId) as object,
      orderBy: { followers: { _count: 'desc' } },
      take: 3,
    });
    return users.map((u) => this.format(u as Record<string, unknown>, userId));
  }

  async getFollowers(username: string, currentUserId?: string) {
    const target = await this.prisma.user.findUnique({ where: { username } });
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    const follows = await this.prisma.follow.findMany({
      where: { followingId: target.id },
      orderBy: { createdAt: 'desc' },
      select: { follower: { select: this.userSelect(currentUserId) as object } },
    });
    return follows.map((f) =>
      this.format(f.follower as Record<string, unknown>, currentUserId),
    );
  }

  async getFollowing(username: string, currentUserId?: string) {
    const target = await this.prisma.user.findUnique({ where: { username } });
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    const follows = await this.prisma.follow.findMany({
      where: { followerId: target.id },
      orderBy: { createdAt: 'desc' },
      select: { following: { select: this.userSelect(currentUserId) as object } },
    });
    return follows.map((f) =>
      this.format(f.following as Record<string, unknown>, currentUserId),
    );
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: this.userSelect(userId) as object,
    });
    return this.format(updated as Record<string, unknown>, userId);
  }
}
