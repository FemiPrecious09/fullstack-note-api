const { pool } = require("../db/database")

const createNoteTable = async()=>{
 await pool.query(`
  CREATE TABLE IF NOT EXISTS note(
   id SERIAL PRIMARY KEY, 
   public_id UUID UNIQUE DEFAULT gen_random_uuid(), 
   title TEXT NOT NULL, 
   body TEXT, 
   summary TEXT,
   tags TEXT[],
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
   profile_id UUID, 
   CONSTRAINT fk_note FOREIGN KEY (profile_id) REFERENCES profile(public_id)
  ) 
 `)
}

const createNoteDB = async(title,body,profile_id)=>{
 const result = await pool.query(`
  INSERT INTO note(title,body,profile_id) VALUES ($1,$2,$3) RETURNING *
  `, [title,body,profile_id]
 )
 return result.rows[0]
}

const getProfileNote = async(id)=>{
 const result = await pool.query(`
  SELECT * FROM note WHERE profile_id = $1
  `, [id])
 return result.rows
}

const getSortNote = async(sortBy,limit,offset)=>{
 const result = await pool.query(`
  SELECT * FROM note ORDER BY ${sortBy} LIMIT $1 OFFSET $2
 `, [limit,offset])
 return result.rows
}


const getNoteIdDB = async(id)=>{
 const result = await pool.query(`
  SELECT * FROM note WHERE public_id = $1
  `, [id])
 return result.rows[0]
}

const sortNote = async(sortBy,limit,offset,id)=>{
 const result = await pool.query(`
  SELECT * FROM note WHERE profile_id= $1 ORDER BY ${sortBy} LIMIT $2 OFFSET $3
 `, [id,limit,offset])
 return result.rows
}

const replaceNoteDB = async(title,body,id)=>{
 const result = await pool.query(`
  UPDATE note 
  SET 
   title=$1, 
   body=$2, 
   updated_at= NOW() WHERE public_id=$3
   RETURNING* 
 `,[title,body,id])
 return result.rows[0]
}

const updateNoteDB = async(title,body,id)=>{
 const result = await pool.query(`
  UPDATE note 
  SET 
   title=COALESCE($1,title), 
   body=COALESCE($2,body), 
   updated_at= NOW() WHERE public_id=$3
   RETURNING* 
 `,[title,body,id])
 return result.rows[0]
}

const getSummary = async(id)=>{
  const result = await pool.query(`
    SELECT summary FROM note WHERE public_id=$1
  `,[id])
  return result.rows[0].summary
}

const storeSummary = async(id,summary)=>{
  const result = await pool.query(`
    UPDATE note SET summary=$1 WHERE public_id=$2 
    RETURNING summary
  `,[summary,id])
  return result.rows[0]
}

const getTags = async(id)=>{
  const result = await pool.query(`
    SELECT tags FROM note WHERE public_id=$1
  `,[id])
  return result.rows[0].tags
}

const storeTags = async(id,tags)=>{
  const result = await pool.query(`
    UPDATE note SET tags=$1 WHERE public_id=$2 
    RETURNING tags
  `,[tags,id])
  return result.rows[0]
}

const deleteNoteDB = async(id)=>{
 const result = await pool.query(`
  DELETE FROM note WHERE public_id=$1 RETURNING *
 `, [id])
 return result.rows[0]
}

module.exports = {createNoteTable, createNoteDB, getNoteIdDB, sortNote, replaceNoteDB, updateNoteDB, deleteNoteDB, getProfileNote, getSortNote, storeSummary, getSummary, getTags, storeTags}