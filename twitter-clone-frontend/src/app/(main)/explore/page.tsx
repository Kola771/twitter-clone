'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useExploreTweets } from '@/hooks/useTweets';
import { useSearchUsers } from '@/hooks/useUsers';
import TweetList from '@/components/tweet/TweetList';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);

  const { data: tweets, isLoading: loadingTweets } = useExploreTweets(query);
  const { data: users, isLoading: loadingUsers } = useSearchUsers(query);

  return (
    <div>
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-slate-950/80 border-b border-slate-800 px-4 py-3">
        <h1 className="text-xl font-bold mb-3">Explorer</h1>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 fill-none stroke-slate-400 stroke-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des tweets ou des utilisateurs"
            className="w-full bg-slate-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </header>

      {query.length < 2 ? (
        <div className="py-16 text-center text-slate-400">
          <p>Tape pour rechercher des tweets ou des utilisateurs.</p>
        </div>
      ) : (
        <div>
          {/* Users */}
          {(loadingUsers || (users && users.length > 0)) && (
            <section className="border-b border-slate-800 py-4">
              <h2 className="px-4 text-base font-bold mb-3">Utilisateurs</h2>
              {loadingUsers ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : (
                users?.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/50 transition-colors"
                  >
                    <Avatar src={user.avatarUrl} alt={user.name} size="md" />
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-slate-400 text-sm">@{user.username}</p>
                    </div>
                  </Link>
                ))
              )}
            </section>
          )}

          {/* Tweets */}
          <section>
            <h2 className="px-4 py-3 text-base font-bold border-b border-slate-800">Tweets</h2>
            <TweetList
              tweets={tweets ?? []}
              isLoading={loadingTweets}
              queryKeys={['explore', query]}
              emptyMessage="Aucun tweet trouvé."
            />
          </section>
        </div>
      )}
    </div>
  );
}
