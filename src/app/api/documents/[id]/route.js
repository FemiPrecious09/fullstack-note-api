import { NextResponse } from "next/server";
import { getDocument, deleteDocument } from "../../../../lib/controllers/document_controller";
import { authorize } from "../../../../lib/middlewares/auth";

// GET /api/documents/123
export const GET = async (_, { params }) => {
 try {
  const { id } = await params; 
  const user = await authorize();
  
  const document = await getDocument(user, id);
  return NextResponse.json(document);
 }catch (err) {
  return NextResponse.json({ error: err.message }, { status: 401 });
 }
};

// DELETE /api/documents/123
export const DELETE = async (_, { params }) => {
 try {
  const { id } = await params;
  const user = await authorize();
  
  const document = await deleteDocument(user, id);
  return NextResponse.json(document);
 } catch (err) {
   return NextResponse.json({ error: err.message }, { status: 400 });
  }
};