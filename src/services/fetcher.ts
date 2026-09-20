import { ApiErrorPayload } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(status: number, message: string, payload: ApiErrorPayload | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface FetcherOptions extends RequestInit {
  /** Set to true to skip the automatic redirect-to-login on 401 (e.g. for the login/register calls themselves) */
  skipAuthRedirect?: boolean;
}

/**
 * Centralized fetch wrapper.
 * - Always sends credentials (httpOnly cookie auth).
 * - Parses JSON responses and throws ApiError on non-2xx.
 * - Redirects to /login on 401 unless skipAuthRedirect is set.
 */
export async function apiFetch<T>(
  path: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { skipAuthRedirect, headers, body, ...rest } = options;

  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    body,
    credentials: "include",
    headers: isFormData
      ? headers // let the browser set multipart boundary itself
      : {
          "Content-Type": "application/json",
          ...headers,
        },
  });

  // No content (e.g. 204 on DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    if (response.status === 401 && !skipAuthRedirect && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    const errPayload = (payload ?? null) as ApiErrorPayload | null;
    const message =
      errPayload?.message ?? errPayload?.error ?? `Request failed with status ${response.status}`;

    throw new ApiError(response.status, message, errPayload);
  }

  return payload as T;
}

// Convenience helpers
export const apiGet = <T>(path: string, options?: FetcherOptions) =>
  apiFetch<T>(path, { ...options, method: "GET" });

export const apiPost = <T>(path: string, body?: unknown, options?: FetcherOptions) =>
  apiFetch<T>(path, {
    ...options,
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });

export const apiPut = <T>(path: string, body?: unknown, options?: FetcherOptions) =>
  apiFetch<T>(path, { ...options, method: "PUT", body: JSON.stringify(body ?? {}) });

export const apiPatch = <T>(path: string, body?: unknown, options?: FetcherOptions) =>
  apiFetch<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body ?? {}) });

export const apiDelete = <T>(path: string, options?: FetcherOptions) =>
  apiFetch<T>(path, { ...options, method: "DELETE" });