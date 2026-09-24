import { apiGet, apiPost, ApiError } from "../fetcher";
import { Profile } from "../types";

export async function getProfile(): Promise<Profile | null> {
  try {
    return await apiGet<Profile>("/api/profile");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function saveProfile(payload: Profile): Promise<Profile> {
  return apiPost<Profile>("/api/profile", payload);
}