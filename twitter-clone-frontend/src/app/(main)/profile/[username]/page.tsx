'use client';

import { use, useState } from 'react';
import { useUser } from '@/hooks/useUsers';
import { useUserTweets } from '@/hooks/useTweets';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import FollowButton from '@/components/user/FollowButton';
import EditProfileModal from '@/components/user/EditProfileModal';
import TweetList from '@/components/tweet/TweetList';
import Spinner from '@/components/ui/Spinner';
import { formatCount } from '@/lib/utils';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user: me } = useAuth();
  const { data: user, isLoading } = useUser(username);
  const { data: tweets, isLoading: loadingTweets } = useUserTweets(username);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-lg">Utilisateur introuvable.</p>
      </div>
    );
  }

  const isMe = me?.username === username;

  return (
    <>
      <div>
        {/* Sticky header */}
        <header className="sticky top-0 z-10 backdrop-blur-sm bg-slate-950/80 border-b border-slate-800 px-4 py-3">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-slate-400 text-sm">{user.tweetsCount} tweets</p>
        </header>

        {/* Banner + avatar overlap */}
        <div className="relative">
          {/* Banner */}
          <div className="h-36 bg-sky-900 overflow-hidden">
            {user.bannerUrl && (
              <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Avatar — positionné à cheval sur le bas du banner */}
          <div className="absolute bottom-0 left-4 translate-y-1/2">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="xl"
              className="border-4 border-slate-950 ring-0"
            />
          </div>
        </div>

        {/* Bouton action — à droite, aligné avec le bas du banner */}
        <div className="flex justify-end px-4 pt-3 pb-2">
          {isMe ? (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Modifier le profil
            </Button>
          ) : (
            <FollowButton username={user.username} isFollowing={user.isFollowing ?? false} />
          )}
        </div>

        {/* Infos profil — padding-top pour laisser place à l'avatar */}
        <div className="px-4 pt-6 pb-4">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-slate-400 text-sm">@{user.username}</p>
          {user.bio && <p className="mt-3 text-slate-200 leading-relaxed">{user.bio}</p>}

          <div className="flex gap-5 mt-4 text-sm">
            <span>
              <strong className="text-slate-100">{formatCount(user.followingCount)}</strong>{' '}
              <span className="text-slate-400">Abonnements</span>
            </span>
            <span>
              <strong className="text-slate-100">{formatCount(user.followersCount)}</strong>{' '}
              <span className="text-slate-400">Abonnés</span>
            </span>
          </div>
        </div>

        {/* Tweets */}
        <div className="border-t border-slate-800">
          <div className="px-4 py-3 border-b border-slate-800">
            <span className="font-bold text-sm border-b-2 border-sky-500 pb-3">Tweets</span>
          </div>
          <TweetList
            tweets={tweets ?? []}
            isLoading={loadingTweets}
            queryKeys={['user-tweets', username]}
            emptyMessage="Aucun tweet pour le moment."
          />
        </div>
      </div>

      {/* Modal édition */}
      {editOpen && <EditProfileModal user={user} onClose={() => setEditOpen(false)} />}
    </>
  );
}
