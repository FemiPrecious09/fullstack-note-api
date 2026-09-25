import { NextResponse } from "next/server";
import { reprocessDocument } from "@/lib/controllers/document_controller";
import { authorize } from "@/lib/middlewares/auth";

export const POST = async (_, { params }) => {
  try {
    const { id } = await params;
    const user = await authorize();
    const result = await reprocessDocument(user, id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};