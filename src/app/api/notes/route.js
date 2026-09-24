import { NextResponse } from "next/server";
import { getNote, addNote } from "@/lib/controllers/notes_controller";
import { authorize, authorizeRead } from "@/lib/middlewares/auth";

// Handles GET /api/notes?page=1&limit=10&sort=newest
export const GET = async (request,{params})=>{
 try{
  const { slug } = await params
  const id = slug[0]
  const action = slug[1]
  const user = await authorize()
  await authorizeOwner(user,id)
  if(action === "summary"){
   const { searchParams } = new URL(request.url)
   const forceRefresh = searchParams.get("refresh") === "true"
   const summary = await summarizeNote(id, forceRefresh);
   return NextResponse.json(summary); 
  }else if(action === "tags"){
   const tags = await createTags(id)
   return NextResponse.json(tags); 
  }else if(action === "chat"){
   const history = await getNoteChatHistory(id)
   return NextResponse.json({ messages: history })
  }
  const note = await getNoteId(id)
  return NextResponse.json(note); 
 }catch(err){
  return NextResponse.json({error: err.message}, { status: 401 })
 }
}

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