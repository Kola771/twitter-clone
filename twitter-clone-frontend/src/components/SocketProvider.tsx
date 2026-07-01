'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getSocket, disconnectSocket } from '@/lib/socket';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (!isAuthenticated || !token) return;

    const socket = getSocket(token);

    const handleNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    return () => disconnectSocket();
  }, []);

  return <>{children}</>;
}
