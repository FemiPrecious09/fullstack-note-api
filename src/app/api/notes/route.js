import { NextResponse } from "next/server";
import { summarizeNote,getNoteId,createTags,replaceNote,updateNote,delNote,askNote } from "@/lib/controllers/notes_controller";
import { authorizeOwner, authorize, authorizeRead } from "@/lib/middlewares/auth";

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
  }
  const note = await getNoteId(id)
  return NextResponse.json(note); 
 }catch(err){
  return NextResponse.json({error: err.message}, { status: 401 })
 }
}

export const POST = async (request,{params})=>{
 try{
  const { slug } = await params
  const id = slug[0]
  const action = slug[1]
  const user = await authorize()
  await authorizeOwner(user,id)
  if(action === "chat"){
   const body = await request.json()
   const result = await askNote(user, id, body.message)
   return NextResponse.json(result)
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 })
 }catch(err){
  return NextResponse.json({error: err.message}, { status: err.status || 400 })
 }
}

export const PUT = async (request,{params})=>{
 try{
  const { slug } = await params
  const id = slug[0]
  const body = await request.json()
  const user = await authorize()
  await authorizeOwner(user,id)
  const notes = await replaceNote(id,body)
  return NextResponse.json(notes); 
 }catch(err){
  return NextResponse.json({error: err.message}, { status: 400 })
 }
}

export const PATCH = async (request,{params})=>{
 try{
  const { slug } = await params
  const id = slug[0]
  const body = await request.json()
  const user = await authorize()
  await authorizeOwner(user,id)
  const notes = await updateNote(id,body)
  return NextResponse.json(notes); 
 }catch(err){
  return NextResponse.json({error: err.message}, { status: 400 })
 }
}
export const DELETE = async (request, {params})=>{
 try{
  const { slug } = await params
  const id = slug[0]
  const user = await authorize()
  await authorizeOwner(user,id)
  const notes = await delNote(id)
  return NextResponse.json(notes); 
 }catch(err){
  return NextResponse.json({error: err.message}, {status: 400})
 }
}