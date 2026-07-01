'use client';

import { useFollowUser } from '@/hooks/useUsers';
import Button from '@/components/ui/Button';

interface FollowButtonProps {
  username: string;
  isFollowing: boolean;
}

export default function FollowButton({ username, isFollowing }: FollowButtonProps) {
  const mutation = useFollowUser();

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      size="sm"
      loading={mutation.isPending}
      onClick={() => mutation.mutate({ username, isFollowing })}
    >
      {isFollowing ? 'Se désabonner' : 'Suivre'}
    </Button>
  );
}
