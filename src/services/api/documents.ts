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
  return apiGet<DocumentListResponse>(`/api/documents?${query.toString()}`);
}

export async function getDocument(id: string): Promise<DocumentItem> {
  return apiGet<DocumentItem>(`/api/documents/${id}`);
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