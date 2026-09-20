import { apiPost } from "../fetcher";
import { User } from "../types";

export interface RegisterPayload {
  username: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  return apiPost<User>("/api/auth/register", payload, { skipAuthRedirect: true });
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  return apiPost<User>("/api/auth/login", payload, { skipAuthRedirect: true });
}

export async function logoutUser(): Promise<void> {
  return apiPost<void>("/api/auth/logout", undefined, { skipAuthRedirect: true });
}