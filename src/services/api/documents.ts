import { apiGet, apiPost, apiDelete } from "../fetcher";
import { DocumentItem, DocumentListResponse } from "../types";

export interface ListDocumentsParams {
  limit?: number;
  offset?: number;
}

export async function listDocuments(
  params: ListDocumentsParams = {}
): Promise<DocumentListResponse> {
  const { limit = 10, offset = 0 } = params;
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiGet<DocumentListResponse>(`/api/documents?${query.toString()}`, { skipAuthRedirect: true });
}

export async function getDocument(id: string): Promise<DocumentItem> {
  return apiGet<DocumentItem>(`/api/documents/${id}`, { skipAuthRedirect: true });
}

export async function uploadDocument(file: File, title: string): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  return apiPost<DocumentItem>("/api/documents", formData);
}

export async function deleteDocument(id: string): Promise<void> {
  return apiDelete<void>(`/api/documents/${id}`);
}

export interface DocumentChatResponse {
  answer: string;
}
export interface DocumentSummaryResponse {
  summary: string;
  source?: string;
}
export interface DocumentTagsResponse {
  tags: string[];
}

export async function getDocumentSummary(id: string, refresh = false): Promise<DocumentSummaryResponse> {
  const query = refresh ? "?refresh=true" : "";
  return apiGet<DocumentSummaryResponse>(`/api/documents/${id}/summary${query}`);
}

export async function getDocumentTags(id: string): Promise<DocumentTagsResponse> {
  return apiGet<DocumentTagsResponse>(`/api/documents/${id}/tags`);
}

export async function askDocument(id: string, message: string): Promise<DocumentChatResponse> {
  return apiPost<DocumentChatResponse>(`/api/documents/${id}/chat`, { message });
}

export async function getDocumentChatHistory(id: string) {
  return apiGet<{ messages: { role: "user" | "assistant"; content: string; created_at: string }[] }>(
    `/api/documents/${id}/chat`
  );
}

export async function reprocessDocument(id: string): Promise<{ status: string }> {
  return apiPost<{ status: string }>(`/api/documents/${id}/reprocess`, undefined);
}