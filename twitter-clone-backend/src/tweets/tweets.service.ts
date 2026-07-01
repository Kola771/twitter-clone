import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTweetDto } from './dto/create-tweet.dto';

@Injectable()
export class TweetsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private tweetInclude(userId: string) {
    return {
      author: {
        select: {
          id: true, username: true, name: true,
          avatarUrl: true, bio: true,
          _count: { select: { followers: true, following: true, tweets: true } },
        },
      },
      replyTo: {
        include: {
          author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        },
      },
      _count: { select: { likes: true, retweets: true, replies: true } },
      likes: { where: { userId }, select: { id: true } },
      retweets: { where: { userId }, select: { id: true } },
    } as const;
  }

  private format(tweet: Record<string, unknown>) {
    const { _count, likes, retweets, author, ...rest } = tweet as {
      _count: { likes: number; retweets: number; replies: number };
      likes: { id: string }[];
      retweets: { id: string }[];
      author: { _count?: { followers: number; following: number; tweets: number }; [key: string]: unknown };
      [key: string]: unknown;
    };

    const { _count: authorCount, ...authorRest } = author;

    return {
      ...rest,
      author: {
        ...authorRest,
        followersCount: authorCount?.followers ?? 0,
        followingCount: authorCount?.following ?? 0,
        tweetsCount: authorCount?.tweets ?? 0,
      },
      likesCount: _count.likes,
      retweetsCount: _count.retweets,
      repliesCount: _count.replies,
      isLiked: likes.length > 0,
      isRetweeted: retweets.length > 0,
    };
  }

  async create(userId: string, dto: CreateTweetDto) {
    const tweet = await this.prisma.tweet.create({
      data: { ...dto, content: dto.content ?? '', authorId: userId },
      include: this.tweetInclude(userId) as object,
    });

    if (dto.replyToId) {
      const parent = await this.prisma.tweet.findUnique({ where: { id: dto.replyToId } });
      if (parent) {
        await this.notifications.create({
          type: 'REPLY',
          recipientId: parent.authorId,
          actorId: userId,
          tweetId: tweet.id,
        });
      }
    }

    return this.format(tweet as Record<string, unknown>);
  }

  async getFeed(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = follows.map((f) => f.followingId);

    const tweets = await this.prisma.tweet.findMany({
      where: {
        authorId: { in: [...followingIds, userId] },
        replyToId: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: this.tweetInclude(userId) as object,
    });
    return tweets.map((t) => this.format(t as Record<string, unknown>));
  }

  async findOne(id: string, userId: string) {
    const tweet = await this.prisma.tweet.findUnique({
      where: { id },
      include: this.tweetInclude(userId) as object,
    });
    if (!tweet) throw new NotFoundException('Tweet introuvable');
    return this.format(tweet as Record<string, unknown>);
  }

  async getReplies(tweetId: string, userId: string) {
    const replies = await this.prisma.tweet.findMany({
      where: { replyToId: tweetId },
      orderBy: { createdAt: 'asc' },
      include: this.tweetInclude(userId) as object,
    });
    return replies.map((t) => this.format(t as Record<string, unknown>));
  }

  async getUserTweets(username: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const tweets = await this.prisma.tweet.findMany({
      where: { authorId: user.id, replyToId: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: this.tweetInclude(userId) as object,
    });
    return tweets.map((t) => this.format(t as Record<string, unknown>));
  }

  async getTrends() {
    const tweets = await this.prisma.tweet.findMany({
      where: { content: { contains: '#' } },
      select: { content: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const counts = new Map<string, number>();
    const hashtagRegex = /#(\w+)/g;

    for (const tweet of tweets) {
      const seen = new Set<string>();
      for (const match of tweet.content.matchAll(hashtagRegex)) {
        const tag = match[1].toLowerCase();
        if (seen.has(tag)) continue;
        seen.add(tag);
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }

  async search(q: string, userId: string) {
    const tweets = await this.prisma.tweet.findMany({
      where: { content: { contains: q, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: this.tweetInclude(userId) as object,
    });
    return tweets.map((t) => this.format(t as Record<string, unknown>));
  }

  async delete(id: string, userId: string) {
    const tweet = await this.prisma.tweet.findUnique({ where: { id } });
    if (!tweet) throw new NotFoundException('Tweet introuvable');

    const isOwnTweet = tweet.authorId === userId;
    let isParentAuthor = false;
    if (!isOwnTweet && tweet.replyToId) {
      const parent = await this.prisma.tweet.findUnique({ where: { id: tweet.replyToId } });
      isParentAuthor = parent?.authorId === userId;
    }
    if (!isOwnTweet && !isParentAuthor) throw new ForbiddenException();

    await this.prisma.tweet.delete({ where: { id } });
    return { success: true };
  }
}
