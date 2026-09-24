import { NextResponse } from "next/server";
import { getNote, addNote } from "@/lib/controllers/notes_controller";
import { authorize, authorizeRead } from "@/lib/middlewares/auth";

// Handles GET /api/notes?page=1&limit=10&sort=newest
export const GET = async (request) => {
  try {
    const user = await authorize();
    await authorizeRead(user);

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sort = searchParams.get("sort") || "newest";

    const notes = await getNote(user, page, limit, sort);

    return NextResponse.json(notes);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

// Handles POST /api/notes
export const POST = async (request) => {
  try {
    const user = await authorize();
    const body = await request.json();

    const newNote = await addNote(user, body);
    return NextResponse.json(newNote, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};