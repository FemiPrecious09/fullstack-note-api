import { NextResponse } from "next/server";
import { summarizeDocument } from "@/lib/controllers/document_controller";
import { authorize } from "@/lib/middlewares/auth";

export const GET = async (request, { params }) => {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";
    const user = await authorize();
    const result = await summarizeDocument(user, id, forceRefresh);
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
    const title = formData.get("title"); // Get title if frontend sends it

    const document = await uploadDocument(user, file, title);
    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};