// ---------- Auth ----------
export interface User {
  id: string;
  username: string;
}

// ---------- Profile ----------
export interface Profile {
  occupation: string;
  industry: string;
  hobbies: string;
  current_learning: string;
  learning_style: string;
  goal: string;
  language_preference: string;
}

// ---------- Documents ----------
export interface DocumentItem {
  id: string;
  title: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
  updated_at?: string;
}

export interface DocumentListResponse {
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
  data: DocumentItem[];
}

// ---------- Notes ----------
export interface Note {
  id: string;
  title: string;
  notebody: string;
  created_at: string;
  updated_at?: string;
}

export interface NoteSummary {
  summary: string;
}

export interface NoteTags {
  tags: string[];
}

// ---------- Chat (client-side only, for viewer UI) ----------
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// ---------- API error shape ----------
export interface ApiErrorPayload {
  message?: string;
  error?: string;
  [key: string]: unknown;
}