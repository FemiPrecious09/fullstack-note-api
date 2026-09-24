import { NextResponse } from "next/server";
import { getRecentConversations } from "../../../../lib/controllers/chat_controller";
import { authorize } from "../../../../lib/middlewares/auth";

export const GET = async (request) => {
  try {
    const user = await authorize();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const conversations = await getRecentConversations(user, limit);
    return NextResponse.json({ conversations });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};