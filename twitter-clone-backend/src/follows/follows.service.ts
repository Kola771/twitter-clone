import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: string, username: string) {
    const target = await this.prisma.user.findUnique({ where: { username } });
    if (!target) throw new NotFoundException('Utilisateur introuvable');
    if (target.id === followerId) throw new BadRequestException('Impossible de se suivre soi-même');

    await this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId: target.id } },
      create: { followerId, followingId: target.id },
      update: {},
    });

    // Notification (ignore si déjà existante)
    await this.prisma.notification
      .create({
        data: { type: 'FOLLOW', recipientId: target.id, actorId: followerId },
      })
      .catch(() => null);

    return { success: true };
  }

  async unfollow(followerId: string, username: string) {
    const target = await this.prisma.user.findUnique({ where: { username } });
    if (!target) throw new NotFoundException('Utilisateur introuvable');

    await this.prisma.follow.deleteMany({
      where: { followerId, followingId: target.id },
    });
    return { success: true };
  }
}
