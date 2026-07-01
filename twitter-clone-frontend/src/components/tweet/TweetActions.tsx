'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Tweet } from '@/types/tweet';
import { formatCount, cn } from '@/lib/utils';
import ReplyModal from './ReplyModal';

interface TweetActionsProps {
  tweet: Tweet;
  queryKeys?: string[];
}

export default function TweetActions({ tweet, queryKeys = [] }: TweetActionsProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const qc = useQueryClient();

  function invalidate() {
    queryKeys.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
  }

  const likeMutation = useMutation({
    mutationFn: () =>
      tweet.isLiked
        ? api.delete(`/likes/${tweet.id}`)
        : api.post('/likes', { tweetId: tweet.id }),
    onSuccess: invalidate,
  });

  const retweetMutation = useMutation({
    mutationFn: () =>
      tweet.isRetweeted
        ? api.delete(`/retweets/${tweet.id}`)
        : api.post('/retweets', { tweetId: tweet.id }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tweets/${tweet.id}`),
    onSuccess: invalidate,
  });

  return (
    <>
      <div className="flex items-center gap-4 mt-3">
        {/* Reply */}
        <button
          onClick={() => setReplyOpen(true)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-sky-400 transition-colors group"
        >
          <span className="p-2 rounded-full group-hover:bg-sky-400/10 transition-colors">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
          </span>
          <span className="text-sm">{formatCount(tweet.repliesCount)}</span>
        </button>

        {/* Retweet */}
        <button
          onClick={() => retweetMutation.mutate()}
          disabled={retweetMutation.isPending}
          className={cn(
            'flex items-center gap-1.5 transition-colors group',
            tweet.isRetweeted ? 'text-green-400' : 'text-slate-400 hover:text-green-400'
          )}
        >
          <span className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
            </svg>
          </span>
          <span className="text-sm">{formatCount(tweet.retweetsCount)}</span>
        </button>

        {/* Like */}
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className={cn(
            'flex items-center gap-1.5 transition-colors group',
            tweet.isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'
          )}
        >
          <span className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
            <svg
              viewBox="0 0 24 24"
              className={cn('h-5 w-5', tweet.isLiked ? 'fill-current' : 'fill-none stroke-current stroke-2')}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </span>
          <span className="text-sm">{formatCount(tweet.likesCount)}</span>
        </button>

        {/* Delete */}
        <button
          onClick={() => { if (confirm('Supprimer ce tweet ?')) deleteMutation.mutate(); }}
          disabled={deleteMutation.isPending}
          className="ml-auto text-slate-600 hover:text-red-400 transition-colors"
          title="Supprimer"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Modale de réponse */}
      {replyOpen && (
        <ReplyModal
          tweet={tweet}
          queryKeys={queryKeys}
          onClose={() => setReplyOpen(false)}
        />
      )}
    </>
  );
}
