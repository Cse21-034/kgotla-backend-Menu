// hooks/use-auth.ts
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

export function useAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (error || data === null) {
    localStorage.removeItem('jwt_token');
    return { user: null, isLoading: false, hasChecked: true };
  }

  return {
    user: data?.user || null,
    isLoading,
    hasChecked: true,
  };
}
