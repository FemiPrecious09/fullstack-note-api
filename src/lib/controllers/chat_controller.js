import { getRecentChats } from "../models/chat_model";

export const getRecentConversations = async (user, limit = 10) => {
  return await getRecentChats(user.public_id, limit)
}