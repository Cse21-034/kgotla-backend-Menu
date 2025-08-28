// hooks/use-auth.ts
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

export function useAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0, // Prevent caching
  });

  if (error || data === null) {
    console.log("useAuth: No user authenticated, error:", error);
    localStorage.removeItem('jwt_token');
    return { user: null, isLoading: false, hasChecked: true };
  }

  console.log("useAuth: User authenticated:", data?.user);
  return {
    user: data?.user || null,
    isLoading,
    hasChecked: true,
  };
}
