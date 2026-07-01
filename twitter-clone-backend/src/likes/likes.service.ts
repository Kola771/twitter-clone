import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async like(userId: string, tweetId: string) {
    const tweet = await this.prisma.tweet.findUnique({ where: { id: tweetId } });
    if (!tweet) throw new NotFoundException('Tweet introuvable');

    try {
      await this.prisma.like.create({ data: { userId, tweetId } });
    } catch {
      throw new ConflictException('Tweet déjà liké');
    }

    await this.notifications.create({
      type: 'LIKE',
      recipientId: tweet.authorId,
      actorId: userId,
      tweetId,
    });

    return { success: true };
  }

  async unlike(userId: string, tweetId: string) {
    await this.prisma.like.deleteMany({ where: { userId, tweetId } });
    return { success: true };
  }
}
