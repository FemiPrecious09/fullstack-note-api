import { apiGet, apiPost } from "../fetcher";
import { User } from "../types";

export interface RegisterPayload {
  username: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

interface AuthResponseWrapper {
  message: string;
  data: User;
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  const response = await apiPost<AuthResponseWrapper>("/api/auth/register", payload, {
    skipAuthRedirect: true,
  });
  return response.data;
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  const response = await apiPost<AuthResponseWrapper>("/api/auth/login", payload, {
    skipAuthRedirect: true,
  });
  return response.data;
}

export async function logoutUser(): Promise<void> {
  return apiPost<void>("/api/auth/logout", undefined, { skipAuthRedirect: true });
}

export async function getCurrentUser(): Promise<User> {
  return apiGet<User>("/api/auth/me");
}