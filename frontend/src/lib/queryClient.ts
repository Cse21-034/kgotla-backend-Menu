 // lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";

const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://money-marathon-backend.onrender.com"
).replace(/\/$/, "");

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log("API Request:", method, url, "Data:", data);
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  console.log("API Response Status:", res.status, "Headers:", Object.fromEntries(res.headers));
  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/");
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
    
    console.log("🔍 Query URL:", url);
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    console.log("Response Status:", res.status, "Headers:", Object.fromEntries(res.headers));
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log("Received 401, returning null");
      return null;
    }
    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
