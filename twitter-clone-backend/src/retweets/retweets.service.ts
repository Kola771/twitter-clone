import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RetweetsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async retweet(userId: string, tweetId: string) {
    const tweet = await this.prisma.tweet.findUnique({ where: { id: tweetId } });
    if (!tweet) throw new NotFoundException('Tweet introuvable');

    try {
      await this.prisma.retweet.create({ data: { userId, tweetId } });
    } catch {
      throw new ConflictException('Déjà retweeté');
    }

    await this.notifications.create({
      type: 'RETWEET',
      recipientId: tweet.authorId,
      actorId: userId,
      tweetId,
    });

    return { success: true };
  }

  async unretweet(userId: string, tweetId: string) {
    await this.prisma.retweet.deleteMany({ where: { userId, tweetId } });
    return { success: true };
  }
}
