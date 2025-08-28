// hooks/use-plans.ts
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function usePlans() {
  return useQuery({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/plans');
      if (response.status === 401) {
        console.log("usePlans: 401 Unauthorized, clearing JWT");
        localStorage.removeItem('jwt_token');
        return { plans: [] };
      }
      const data = await response.json();
      console.log("usePlans: /api/plans response:", data);
      return { plans: Array.isArray(data.plans) ? data.plans : [] };
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}
