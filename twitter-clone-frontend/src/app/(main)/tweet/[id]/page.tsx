'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useTweet, useReplies } from '@/hooks/useTweets';
import Avatar from '@/components/ui/Avatar';
import TweetActions from '@/components/tweet/TweetActions';
import TweetForm from '@/components/tweet/TweetForm';
import TweetList from '@/components/tweet/TweetList';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

export default function TweetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const { data: tweet, isLoading } = useTweet(id);
  const { data: replies, isLoading: loadingReplies } = useReplies(id);

  function invalidateAfterReply() {
    qc.invalidateQueries({ queryKey: ['replies', id] });
    qc.invalidateQueries({ queryKey: ['tweet', id] });
    qc.invalidateQueries({ queryKey: ['feed'] });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-lg">Tweet introuvable.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Tweet</h1>
      </header>

      {/* Tweet principal — vue détaillée */}
      <article className="px-4 pt-4 pb-3 border-b border-slate-800">
        {/* Auteur */}
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/profile/${tweet.author.username}`}>
            <Avatar src={tweet.author.avatarUrl} alt={tweet.author.name} size="md" />
          </Link>
          <div>
            <Link href={`/profile/${tweet.author.username}`} className="font-bold hover:underline block leading-tight">
              {tweet.author.name}
            </Link>
            <span className="text-slate-400 text-sm">@{tweet.author.username}</span>
          </div>
        </div>

        {/* Réponse à */}
        {tweet.replyTo && (
          <p className="text-slate-400 text-sm mb-2">
            En réponse à{' '}
            <Link href={`/profile/${tweet.replyTo.author.username}`} className="text-sky-400 hover:underline">
              @{tweet.replyTo.author.username}
            </Link>
          </p>
        )}

        {/* Contenu */}
        <p className="text-slate-100 text-xl leading-relaxed whitespace-pre-wrap break-words mb-3">
          {tweet.content}
        </p>

        {/* Média */}
        {tweet.mediaUrl && (() => {
          const isVideo = tweet.mediaUrl!.includes('/video/');
          const isGif   = tweet.mediaUrl!.includes('giphy.com');
          return (
            <div className={`rounded-2xl overflow-hidden border border-slate-800 mb-3 ${isGif ? 'w-fit' : ''}`}>
              {isVideo ? (
                <video src={tweet.mediaUrl} controls className="w-full max-h-96 object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tweet.mediaUrl}
                  alt="Tweet media"
                  className={isGif ? 'max-h-56 w-auto' : 'w-full object-cover max-h-96'}
                />
              )}
            </div>
          );
        })()}

        {/* Date complète */}
        <p className="text-slate-500 text-sm border-b border-slate-800 pb-3 mb-1">
          {new Date(tweet.createdAt).toLocaleString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>

        {/* Stats */}
        {(tweet.retweetsCount > 0 || tweet.likesCount > 0 || tweet.repliesCount > 0) && (
          <div className="flex gap-5 py-3 border-b border-slate-800 text-sm">
            {tweet.repliesCount > 0 && (
              <span><strong>{tweet.repliesCount}</strong> <span className="text-slate-400">Réponse{tweet.repliesCount > 1 ? 's' : ''}</span></span>
            )}
            {tweet.retweetsCount > 0 && (
              <span><strong>{tweet.retweetsCount}</strong> <span className="text-slate-400">Retweet{tweet.retweetsCount > 1 ? 's' : ''}</span></span>
            )}
            {tweet.likesCount > 0 && (
              <span><strong>{tweet.likesCount}</strong> <span className="text-slate-400">J&apos;aime{tweet.likesCount > 1 ? 's' : ''}</span></span>
            )}
          </div>
        )}

        {/* Actions */}
        <TweetActions tweet={tweet} queryKeys={['tweet', id, 'feed', 'replies']} />
      </article>

      {/* Formulaire de réponse */}
      <TweetForm
        placeholder="Rédige ta réponse..."
        replyToId={id}
        queryKeys={[]}
        onSuccess={invalidateAfterReply}
      />

      {/* Séparateur */}
      <div className="px-4 py-3 border-b border-slate-800">
        <h2 className="font-bold text-slate-300 text-sm">
          {replies?.length ?? 0} réponse{(replies?.length ?? 0) !== 1 ? 's' : ''}
        </h2>
      </div>

      {/* Liste des réponses */}
      <TweetList
        tweets={replies ?? []}
        isLoading={loadingReplies}
        queryKeys={['replies', id]}
        emptyMessage="Aucune réponse pour l'instant. Sois le premier !"
      />
    </div>
  );
}
