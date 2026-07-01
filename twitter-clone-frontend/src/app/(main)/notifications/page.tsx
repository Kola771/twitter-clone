'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'follow' | 'reply';
  actor: { username: string; name: string; avatarUrl?: string };
  tweetId?: string;
  isRead: boolean;
  createdAt: string;
}

const typeLabels: Record<Notification['type'], string> = {
  like: 'a aimé votre tweet',
  retweet: 'a retweeté votre tweet',
  follow: 'vous suit maintenant',
  reply: 'a répondu à votre tweet',
};

const typeIcons: Record<Notification['type'], React.ReactNode> = {
  like: <span className="text-pink-500 text-xl">♥</span>,
  retweet: <span className="text-green-400 text-xl">↺</span>,
  follow: <span className="text-sky-400 text-xl">👤</span>,
  reply: <span className="text-sky-400 text-xl">💬</span>,
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/notifications').then((r) => r.data),
  });

  return (
    <div>
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-slate-950/80 border-b border-slate-800 px-4 py-3">
        <h1 className="text-xl font-bold">Notifications</h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !notifications?.length ? (
        <div className="py-16 text-center text-slate-400">
          <p className="text-lg">Aucune notification pour l&apos;instant.</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-4 px-4 py-4 border-b border-slate-800 ${
              !n.isRead ? 'bg-sky-950/20' : ''
            }`}
          >
            <div className="w-8 flex justify-center">{typeIcons[n.type]}</div>
            <Avatar src={n.actor.avatarUrl} alt={n.actor.name} size="sm" />
            <div className="flex-1">
              <p className="text-sm">
                <Link
                  href={`/profile/${n.actor.username}`}
                  className="font-bold hover:underline"
                >
                  {n.actor.name}
                </Link>{' '}
                {typeLabels[n.type]}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{formatDate(n.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
