'use client';

import { QueryClient } from '@tanstack/react-query';

let queryClient: QueryClient | null = null;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return new QueryClient({
      defaultOptions: { queries: { staleTime: 60_000 } },
    });
  }
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
    });
  }
  return queryClient;
}
