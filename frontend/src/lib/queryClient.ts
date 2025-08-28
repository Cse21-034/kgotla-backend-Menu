// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(method: string, endpoint: string, body?: any) {
  console.log("Query URL:", `${import.meta.env.VITE_API_URL}${endpoint}`);
  const token = localStorage.getItem('jwt_token');
  console.log("JWT from localStorage:", token || "None");
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  console.log("Request Headers:", headers);

  const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Kept for compatibility
  });

  console.log("Response Status:", response.status);
  console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

  if (!response.ok && response.status !== 401) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response;
}

export function getQueryFn({ on401 = 'throw' }: { on401?: 'throw' | 'returnNull' } = {}) {
  return async () => {
    const response = await apiRequest('GET', '/api/auth/user');
    if (response.status === 401) {
      console.log("getQueryFn: User not authenticated");
      if (on401 === 'returnNull') return null;
      throw new Error('Not authenticated');
    }
    return response.json();
  };
}
