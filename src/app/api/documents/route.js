import { NextResponse } from "next/server";
import { listDocuments, uploadDocument } from "@/lib/controllers/document_controller";
import { authorize } from "@/lib/middlewares/auth";

// GET /api/documents?limit=10&offset=0
export const GET = async (request) => {
  try {
    const user = await authorize();
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const result = await listDocuments(user, query);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};

// POST /api/documents (File Upload)
export const POST = async (request) => {
  try {
    const user = await authorize();
    const formData = await request.formData();

    const file = formData.get("file");
    const title = formData.get("title");

    const document = await uploadDocument(user, file, title);
    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};