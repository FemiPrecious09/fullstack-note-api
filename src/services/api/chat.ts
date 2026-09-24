import { apiGet } from "../fetcher";

export interface RecentConversation {
  type: "note" | "document";
  id: string;
  title: string;
  last_message_at: string;
}

export async function getRecentConversations(limit = 10): Promise<RecentConversation[]> {
  const res = await apiGet<{ conversations: RecentConversation[] }>(`/api/chat/recent?limit=${limit}`);
  return res.conversations;
}