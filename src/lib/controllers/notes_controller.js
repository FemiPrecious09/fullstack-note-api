import crypto from "crypto";
import { createNoteDB, getNoteIdDB, sortNote, replaceNoteDB, updateNoteDB, deleteNoteDB, getSortNote, storeSummary, getSummary, getTags, storeTags} from "../models/note_model";
import { generateFromGroq } from "../utils/groq_util"; 
import { getUserProfileDB } from "../models/profile_model";
import { buildPersonalization } from "../utils/personalization_util";
import { getChatHistory, addChatMessage } from "../models/chat_model";

const formatNote = (row) => ({
  id: row.public_id,
  title: row.title,
  notebody: row.body,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const asDuplicateTitleError = (err, title) => {
  if (err.code === "23505") {
    const dupErr = new Error(`You already have a note titled "${title}". Try a different title.`)
    dupErr.status = 409
    return dupErr
  }
  return err
}

export const addNote = async (user,body)=>{
 const {title, notebody} = body
 if (!title || !notebody) {
  throw new Error("Title and body are required")
 }
 try {
   const newnote = await createNoteDB(title,notebody,user.public_id)
   return formatNote(newnote)
 } catch (err) {
   throw asDuplicateTitleError(err, title)
 }
}

export const getNoteId = async (id)=>{
 const note = await getNoteIdDB(id)
 if(!note){
  throw new Error("Note Id not found")
 }
 return formatNote(note)
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
 return notes.map(formatNote)
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
 return notes.map(formatNote)
}

export const replaceNote = async (id,body)=>{
 const {title,notebody} = body
 if (!title || !notebody) {
  throw new Error("Title and body are required")
 }
 try {
   const note = await replaceNoteDB(title,notebody,id)
   if(!note){
    throw new Error("Note not found")
   }
   return formatNote(note)
 } catch (err) {
   throw asDuplicateTitleError(err, title)
 }
}

export const updateNote = async (id,body)=>{
 const {title,notebody} = body
 try {
   const note = await updateNoteDB(title,notebody,id)
   if(!note){
    throw new Error("Note not found")
   }
   return formatNote(note)
 } catch (err) {
   throw asDuplicateTitleError(err, title)
 }
}

const summaryCache = new Map()

export const summarizeNote = async (id, forceRefresh = false)=>{
  try{
    if (!forceRefresh) {
      const cachedsummary = await getSummary(id)
      if(cachedsummary){
        return {
          noteId: id,
          summary: cachedsummary,
          source: "cache"
        }
      }
    }
    const note = await getNoteIdDB(id)
    if(!note){
      throw new Error("Note Id not found")
    }

    const profile = await getUserProfileDB(note.profile_id)
    const personalization = buildPersonalization(profile)

    const hash = crypto.createHash("sha256").update(note.body + personalization).digest("hex")
    if (!forceRefresh && summaryCache.has(hash)) {
      const summary = summaryCache.get(hash)
      await storeSummary(id, summary) 
      return { noteId: id, summary, source: "memory" }
    }

    const completion = await generateFromGroq([
        {
          role: "system",
          content: `You are a helpful assistant that summarizes notes clearly and concisely. ${personalization}`
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
 return formatNote(note)
}

export const askNote = async (user, id, question) => {
  const note = await getNoteIdDB(id)
  if (!note) {
    const err = new Error("Note not found")
    err.status = 404
    throw err
  }

  const profile = await getUserProfileDB(user.public_id)
  const personalization = buildPersonalization(profile)

  const history = await getChatHistory("note", id)
  const historyMessages = history.map(m => ({ role: m.role, content: m.content }))

  await addChatMessage("note", id, "user", question)

  const completion = await generateFromGroq([
    {
      role: "system",
      content: `You are KalaRead, an assistant that helps someone understand their own notes. Answer only using the note content below and general knowledge needed to explain it. ${personalization}\n\nNote title: ${note.title}\nNote content: ${note.body}`
    },
    ...historyMessages,
    { role: "user", content: question }
  ])

  const answer = completion.choices[0].message.content
  await addChatMessage("note", id, "assistant", answer)

  return { answer }
}

export const getNoteChatHistory = async (id) => {
  return await getChatHistory("note", id)
}