'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTrends } from '@/hooks/useTweets';
import { useSuggestions } from '@/hooks/useUsers';
import Spinner from '@/components/ui/Spinner';
import Avatar from '@/components/ui/Avatar';
import FollowButton from '@/components/user/FollowButton';

export default function RightPanel() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { data: trends, isLoading: loadingTrends } = useTrends();
  const { data: suggestions, isLoading: loadingSuggestions } = useSuggestions();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 px-4 py-3 h-screen sticky top-0 gap-4">
      {/* Search */}
      <form onSubmit={handleSearch}>
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
            placeholder="Rechercher"
            className="w-full bg-slate-800 rounded-full py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </form>

      {/* Trends */}
      <div className="bg-slate-900 rounded-2xl p-4">
        <h2 className="text-lg font-bold mb-4">Tendances</h2>
        {loadingTrends ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : !trends?.length ? (
          <p className="text-slate-400 text-sm">Aucune tendance pour l&apos;instant.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {trends.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => router.push(`/explore?q=${encodeURIComponent(`#${tag}`)}`)}
                className="cursor-pointer text-left hover:bg-slate-800/60 -mx-2 px-2 py-1 rounded-lg transition-colors"
              >
                <p className="font-semibold text-sm">#{tag}</p>
                <p className="text-slate-400 text-xs">
                  {count} {count > 1 ? 'tweets' : 'tweet'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Who to follow */}
      <div className="bg-slate-900 rounded-2xl p-4">
        <h2 className="text-lg font-bold mb-4">Qui suivre</h2>
        {loadingSuggestions ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : !suggestions?.length ? (
          <p className="text-slate-400 text-sm">Aucune suggestion pour l&apos;instant.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <Link href={`/profile/${user.username}`} className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-slate-400 text-xs truncate">@{user.username}</p>
                  </div>
                </Link>
                <FollowButton username={user.username} isFollowing={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
