import { NextResponse } from "next/server";
import { getDocumentFile } from "@/lib/controllers/document_controller";
import { authorize } from "@/lib/middlewares/auth";

export const GET = async (_, { params }) => {
  try {
    const { id } = await params;
    const user = await authorize();
    const { buffer, mimeType, filename } = await getDocumentFile(user, id);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};