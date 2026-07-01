import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { User } from '@/types/user';

export function useUser(username: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: () => api.get<User>(`/users/${username}`).then((r) => r.data),
    enabled: !!username,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['search-users', query],
    queryFn: () =>
      api.get<User[]>('/users/search', { params: { q: query } }).then((r) => r.data),
    enabled: query.length >= 2,
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: ['user-suggestions'],
    queryFn: () => api.get<User[]>('/users/suggestions').then((r) => r.data),
  });
}

export function useFollowers(username: string) {
  return useQuery({
    queryKey: ['followers', username],
    queryFn: () => api.get<User[]>(`/users/${username}/followers`).then((r) => r.data),
    enabled: !!username,
  });
}

export function useFollowing(username: string) {
  return useQuery({
    queryKey: ['following', username],
    queryFn: () => api.get<User[]>(`/users/${username}/following`).then((r) => r.data),
    enabled: !!username,
  });
}

export function useFollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, isFollowing }: { username: string; isFollowing: boolean }) =>
      isFollowing
        ? api.delete(`/follows/${username}`)
        : api.post('/follows', { username }),
    onSuccess: (_, { username }) => {
      qc.invalidateQueries({ queryKey: ['user', username] });
      qc.invalidateQueries({ queryKey: ['user-suggestions'] });
    },
  });
}
