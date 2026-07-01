export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  isFollowing?: boolean;
  createdAt: string;
}
