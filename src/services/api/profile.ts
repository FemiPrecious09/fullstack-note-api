import { apiGet, apiPost, ApiError } from "../fetcher";
import { Profile } from "../types";

export async function getProfile(): Promise<Profile | null> {
  try {
    return await apiGet<Profile>("/api/profile");
  } catch (err) {
    // Treat "no profile yet" (404) as null instead of throwing,
    // since a fresh user hasn't onboarded yet.
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function saveProfile(payload: Profile): Promise<Profile> {
  return apiPost<Profile>("/api/profile", payload);
}