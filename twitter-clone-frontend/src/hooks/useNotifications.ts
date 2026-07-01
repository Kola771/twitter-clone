import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () =>
      api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count),
  });
}
