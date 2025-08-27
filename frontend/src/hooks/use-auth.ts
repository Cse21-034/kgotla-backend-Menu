import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@/types/schema";

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthResponse | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user: data?.user || null,
    isLoading,
    error,
    isAuthenticated: !!data?.user,
  };
}