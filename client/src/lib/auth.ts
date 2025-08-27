import { apiRequest } from "./queryClient";
import { LoginUser, InsertUser } from "@shared/schema";

export async function login(credentials: LoginUser) {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  return response.json();
}

export async function register(userData: InsertUser) {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  return response.json();
}

export async function logout() {
  const response = await apiRequest("POST", "/api/auth/logout");
  return response.json();
}

export async function getCurrentUser() {
  const response = await apiRequest("GET", "/api/auth/user");
  return response.json();
}
