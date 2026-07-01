'use client';

import TweetForm from '@/components/tweet/TweetForm';
import TweetList from '@/components/tweet/TweetList';
import { useFeed } from '@/hooks/useTweets';

export default function HomePage() {
  const { data: tweets, isLoading } = useFeed();

  return (
    <div>
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-slate-950/80 border-b border-slate-800 px-4 py-3">
        <h1 className="text-xl font-bold">Accueil</h1>
      </header>

      <TweetForm queryKeys={['feed']} />

      <TweetList
        tweets={tweets ?? []}
        isLoading={isLoading}
        queryKeys={['feed']}
        emptyMessage="Suis des personnes pour voir leurs tweets ici."
      />
    </div>
  );
}
