import { apiGet, apiPost, apiPatch, apiDelete } from "../fetcher";
import { Note, NoteSummary, NoteTags } from "../types";

export interface NotePayload {
  title: string;
  notebody: string;
}

export async function listNotes(): Promise<Note[]> {
  return apiGet<Note[]>("/api/notes", { skipAuthRedirect: true });
}

export async function getNote(id: string): Promise<Note> {
  return apiGet<Note>(`/api/notes/${id}`, { skipAuthRedirect: true });
}

export async function createNote(payload: NotePayload): Promise<Note> {
  return apiPost<Note>("/api/notes", payload);
}

export async function updateNote(id: string, payload: NotePayload): Promise<Note> {
  return apiPatch<Note>(`/api/notes/${id}`, payload);
}

export async function deleteNote(id: string): Promise<void> {
  return apiDelete<void>(`/api/notes/${id}`);
}

export async function getNoteSummary(id: string, refresh = false) {
  const query = refresh ? "?refresh=true" : "";
  return apiGet(`/api/notes/${id}/summary${query}`);
}

export async function getNoteTags(id: string): Promise<NoteTags> {
  return apiGet<NoteTags>(`/api/notes/${id}/tags`, { skipAuthRedirect: true });
}
export interface ChatResponse {
  answer: string;
}

export async function askNote(id: string, message: string): Promise<ChatResponse> {
  return apiPost<ChatResponse>(`/api/notes/${id}/chat`, { message });
}

export async function getNoteChatHistory(id: string) {
  return apiGet<{ messages: { role: "user" | "assistant"; content: string; created_at: string }[] }>(
    `/api/notes/${id}/chat`
  );
}