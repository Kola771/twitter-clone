'use client';

import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import FollowButton from '@/components/user/FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/user';

export default function UserListItem({ user }: { user: User }) {
  const { user: me } = useAuth();
  const isMe = me?.username === user.username;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/50 transition-colors">
      <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={user.avatarUrl} alt={user.name} size="md" />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{user.name}</p>
          <p className="text-slate-400 text-sm truncate">@{user.username}</p>
        </div>
      </Link>
      {!isMe && <FollowButton username={user.username} isFollowing={user.isFollowing ?? false} />}
    </div>
  );
}
