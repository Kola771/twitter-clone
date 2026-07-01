'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useFollowers } from '@/hooks/useUsers';
import UserListItem from '@/components/user/UserListItem';
import Spinner from '@/components/ui/Spinner';

export default function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const { data: users, isLoading } = useFollowers(username);

  return (
    <div>
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold">Abonnés</h1>
          <p className="text-slate-400 text-sm">@{username}</p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !users?.length ? (
        <div className="py-16 text-center text-slate-400">
          <p className="text-lg">Aucun abonné pour l&apos;instant.</p>
        </div>
      ) : (
        <div>
          {users.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
