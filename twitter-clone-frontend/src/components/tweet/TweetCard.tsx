import Link from 'next/link';
import { Tweet } from '@/types/tweet';
import Avatar from '@/components/ui/Avatar';
import TweetActions from './TweetActions';
import { formatDate } from '@/lib/utils';

interface TweetCardProps {
  tweet: Tweet;
  queryKeys?: string[];
}

export default function TweetCard({ tweet, queryKeys }: TweetCardProps) {
  return (
    <article className="flex gap-3 px-4 py-3 border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
      <Link href={`/profile/${tweet.author.username}`} className="flex-shrink-0">
        <Avatar src={tweet.author.avatarUrl} alt={tweet.author.name} size="md" />
      </Link>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            href={`/profile/${tweet.author.username}`}
            className="font-bold hover:underline truncate"
          >
            {tweet.author.name}
          </Link>
          <span className="text-slate-400 text-sm truncate">@{tweet.author.username}</span>
          <span className="text-slate-500 text-sm">·</span>
          <span className="text-slate-400 text-sm">{formatDate(tweet.createdAt)}</span>
        </div>

        {/* Reply indicator */}
        {tweet.replyTo && (
          <p className="text-slate-400 text-sm mb-1">
            En réponse à{' '}
            <Link
              href={`/profile/${tweet.replyTo.author.username}`}
              className="text-sky-400 hover:underline"
            >
              @{tweet.replyTo.author.username}
            </Link>
          </p>
        )}

        {/* Content */}
        <Link href={`/tweet/${tweet.id}`}>
          <p className="text-slate-100 whitespace-pre-wrap break-words mt-0.5">{tweet.content}</p>
          {tweet.mediaUrl && (() => {
            const isVideo = tweet.mediaUrl!.includes('/video/');
            const isGif  = tweet.mediaUrl!.includes('giphy.com');
            return (
              <div className={`mt-3 rounded-2xl overflow-hidden border border-slate-800 ${isGif ? 'w-fit' : ''}`}>
                {isVideo ? (
                  <video src={tweet.mediaUrl} controls className="w-full max-h-72 object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tweet.mediaUrl}
                    alt="Tweet media"
                    className={isGif ? 'max-h-48 w-auto' : 'w-full object-cover max-h-72'}
                  />
                )}
              </div>
            );
          })()}
        </Link>

        <TweetActions tweet={tweet} queryKeys={queryKeys} />
      </div>
    </article>
  );
}
