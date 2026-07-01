import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Tweet } from '@/types/tweet';

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: () => api.get<Tweet[]>('/tweets/feed').then((r) => r.data),
  });
}

export function useTweet(id: string) {
  return useQuery({
    queryKey: ['tweet', id],
    queryFn: () => api.get<Tweet>(`/tweets/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUserTweets(username: string) {
  return useQuery({
    queryKey: ['user-tweets', username],
    queryFn: () => api.get<Tweet[]>(`/tweets/user/${username}`).then((r) => r.data),
    enabled: !!username,
  });
}

export function useReplies(tweetId: string) {
  return useQuery({
    queryKey: ['replies', tweetId],
    queryFn: () => api.get<Tweet[]>(`/tweets/${tweetId}/replies`).then((r) => r.data),
    enabled: !!tweetId,
  });
}

export function useExploreTweets(query: string) {
  return useQuery({
    queryKey: ['explore', query],
    queryFn: () =>
      api.get<Tweet[]>('/tweets/search', { params: { q: query } }).then((r) => r.data),
    enabled: query.length >= 2,
  });
}

export interface Trend {
  tag: string;
  count: number;
}

export function useTrends() {
  return useQuery({
    queryKey: ['trends'],
    queryFn: () => api.get<Trend[]>('/tweets/trends').then((r) => r.data),
  });
}
