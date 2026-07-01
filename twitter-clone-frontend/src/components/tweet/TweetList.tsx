'use client';

import { Tweet } from '@/types/tweet';
import TweetCard from './TweetCard';
import Spinner from '@/components/ui/Spinner';

interface TweetListProps {
  tweets: Tweet[];
  isLoading?: boolean;
  queryKeys?: string[];
  emptyMessage?: string;
}

export default function TweetList({
  tweets,
  isLoading,
  queryKeys,
  emptyMessage = 'Aucun tweet à afficher.',
}: TweetListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!tweets.length) {
    return (
      <div className="flex flex-col items-center py-16 text-slate-400">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} queryKeys={queryKeys} />
      ))}
    </div>
  );
}
