import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

type NotificationType = 'LIKE' | 'RETWEET' | 'FOLLOW' | 'REPLY';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async create(data: {
    type: NotificationType;
    recipientId: string;
    actorId: string;
    tweetId?: string;
  }) {
    if (data.recipientId === data.actorId) return null;

    const notif = await this.prisma.notification
      .create({
        data,
        include: {
          actor: { select: { id: true, username: true, name: true, avatarUrl: true } },
          tweet: { select: { id: true, content: true } },
        },
      })
      .catch(() => null);

    if (!notif) return null;

    this.gateway.emitToUser(data.recipientId, {
      id: notif.id,
      type: notif.type.toLowerCase(),
      actor: notif.actor,
      tweetId: notif.tweetId,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    });

    return notif;
  }

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
