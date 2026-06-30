import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const notifs = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        actor: { select: { id: true, username: true, name: true, avatarUrl: true } },
        tweet: { select: { id: true, content: true } },
      },
    });

    await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    return notifs.map((n) => ({
      id: n.id,
      type: n.type.toLowerCase(),
      actor: n.actor,
      tweetId: n.tweetId,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  async countUnread(userId: string) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
    return { count };
  }
}
