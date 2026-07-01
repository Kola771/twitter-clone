import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  return { user, isAuthenticated, logout, setUser };
}
