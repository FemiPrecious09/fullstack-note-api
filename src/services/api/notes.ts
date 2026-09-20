import { apiGet, apiPost, apiPatch, apiDelete } from "../fetcher";
import { Note, NoteSummary, NoteTags } from "../types";

export interface NotePayload {
  title: string;
  notebody: string;
}

export async function listNotes(): Promise<Note[]> {
  return apiGet<Note[]>("/api/notes");
}

export async function getNote(id: string): Promise<Note> {
  return apiGet<Note>(`/api/notes/${id}`);
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

export async function getNoteSummary(id: string): Promise<NoteSummary> {
  return apiGet<NoteSummary>(`/api/notes/${id}/summary`);
}

export async function getNoteTags(id: string): Promise<NoteTags> {
  return apiGet<NoteTags>(`/api/notes/${id}/tags`);
}