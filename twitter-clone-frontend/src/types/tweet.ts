import { User } from './user';

export interface Tweet {
  id: string;
  content: string;
  mediaUrl?: string;
  author: User;
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  isLiked: boolean;
  isRetweeted: boolean;
  replyToId?: string;
  replyTo?: Tweet;
  createdAt: string;
}

export interface CreateTweetRequest {
  content: string;
  mediaUrl?: string;
  replyToId?: string;
}

export interface TweetPage {
  data: Tweet[];
  nextCursor?: string;
  hasMore: boolean;
}
