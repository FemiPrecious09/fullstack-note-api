import { NextResponse } from "next/server";
import { askDocument, getDocumentChatHistory } from "@/lib/controllers/document_controller";
import { authorize } from "@/lib/middlewares/auth";

export const GET = async (_, { params }) => {
  try {
    const { id } = await params;
    const user = await authorize();
    const history = await getDocumentChatHistory(id);
    return NextResponse.json({ messages: history });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};

export const POST = async (request, { params }) => {
  try {
    const { id } = await params;
    const user = await authorize();
    const body = await request.json();
    const result = await askDocument(user, id, body.message);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};