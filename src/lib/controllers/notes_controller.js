import crypto from "crypto";
import { createNoteDB, getNoteIdDB, sortNote, replaceNoteDB, updateNoteDB, deleteNoteDB, getSortNote, storeSummary, getSummary, getTags, storeTags} from "../models/note_model";
import { generateFromGroq } from "../utils/groq_util"; 

export const addNote = async (user,body)=>{
 const {title, notebody} = body
 if (!title || !notebody) {
  throw new Error("Title and body are required")
 }
 const newnote = await createNoteDB(title,notebody,user.public_id)
 return newnote
}

export const getNoteId = async (id)=>{
 const note = await getNoteIdDB(id)
 if(!note){
  throw new Error("Note Id not found")
 }
 return note
}

export const getNote = async (user,page,limit,sort)=>{
 let sortBy = ""
 if(sort === "title"){
   sortBy = "title ASC"
 }else if(sort === "newest"){
  sortBy = "created_at DESC"
 }else if(sort === "last updated"){
  sortBy = "updated_at DESC"
 }else{
  throw new Error("Invalid Sort")
 }
 const startIndex = (page -1) * limit
 const notes = await sortNote(sortBy,limit,startIndex,user.public_id)
 if(!notes){
  throw new Error("Notes not found")
 }
 return notes
}

export const getAllNote = async (page,limit,sort)=>{
 let sortBy = ""
 if(sort === "title"){
   sortBy = "title ASC"
 }else if(sort === "newest"){
  sortBy = "created_at DESC"
 }else if(sort === "last updated"){
  sortBy = "updated_at DESC"
 }else{
  throw new Error("Invalid Sort")
 }
 const startIndex = (page -1) * limit

 const notes = await getSortNote(sortBy,limit,startIndex)
 if(!notes){
  throw new Error("Notes not found")
 }
 return notes
}

export const replaceNote = async (id,body)=>{
 const {title,notebody} = body
 if (!title || !notebody) {
  throw new Error("Title and body are required")
 }
 const note = await replaceNoteDB(title,notebody,id)
 if(!note){
  throw new Error("Note not found")
 }
 return note
}

export const updateNote = async (id,body)=>{
 const {title,notebody} = body
 const note = await updateNoteDB(title,notebody,id)
 if(!note){
  throw new Error("Note not found")
 }
 return note
}

const summaryCache = new Map()

export const summarizeNote = async (id)=>{
  try{
    const cachedsummary = await getSummary(id)
    if(cachedsummary){
      return {
        noteId: id,
        summary: cachedsummary,
        source: "cache"
      }
    }
    const note = await getNoteIdDB(id)
    if(!note){
      throw new Error("Note Id not found")
    }
    const hash = crypto.createHash("sha256").update(note.body).digest("hex")
    if (summaryCache.has(hash)) {
      const summary = summaryCache.get(hash)
      await storeSummary(id, summary) 
      return { noteId: id, summary, source: "memory" }
    }

    const completion = await generateFromGroq([
        {
          role: "system",
          content: "You are a helpful assistant that summarize notes"
        },
        {
          role: "user",
          content: `Summarize this note:\n\nTitle: ${note.title}\n\nBody: ${note.body}`
        }
      ])
    const summary = completion.choices[0].message.content
    summaryCache.set(hash, summary)
    await storeSummary(id,summary)
    return {
      noteId: id,
      summary,
      source: "groq"
    }
  }catch (error) {
    console.error(error)
    if(error.status === 429){
      throw new Error("Too many Request")
    }
    throw new Error ("Failed to generate summary")
  }
}

export const createTags = async(id)=>{
  try{
    const cachedTags = await getTags(id)
    if(cachedTags){
      return {
        noteId: id,
        tags: cachedTags
      }
    }
    const note = await getNoteIdDB(id)
    if(!note){
      throw new Error("Note Id not found")
    }
    const completion = await generateFromGroq([
      {role:"system", content: "You are a helpful assistant that generate tags from notes"},
      {role:"user", content:  `Suggest 5 relevant tags for this note. Return ONLY a JSON array. Title: ${note.title} Body: ${note.body}`}
    ])
    const raw = completion.choices[0].message.content
    let tags
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim()
      tags = JSON.parse(cleaned)
      if (!Array.isArray(tags)) throw new Error("Not an array")
    } catch (parseErr) {
      console.error("LLM returned bad JSON:", raw)
      throw new Error("AI returned invalid tag format")
    }
    await storeTags(id,tags)
    return {
      noteId: id,
      tags
    }
  }catch(err){
    console.log(err)
    if(err.status === 429){
      throw new Error("Too many Request from the Backend")
    }
    throw new Error("Failed to generate Tags")
  }
}

export const delNote = async (id)=>{
 const note = await deleteNoteDB(id)
 if(!note){
  throw new Error("Note not found")
 }
 return note
}
