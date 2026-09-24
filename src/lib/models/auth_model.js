const { pool } = require("../db/database")
const crypt = require("bcryptjs")

const createUserTable = async()=>{
 await pool.query(`
  CREATE TABLE IF NOT EXISTS profile(
   id SERIAL PRIMARY KEY, 
   public_id UUID UNIQUE DEFAULT gen_random_uuid(), 
   username VARCHAR(255) NOT NULL UNIQUE, 
   password TEXT NOT NULL
  )
 `)
}

const createUserDB = async(name,password)=>{
 const hashedPass = crypt.hashSync(password,10)
 const results = await pool.query(`
  INSERT INTO profile(username,password) VALUES ($1,$2) RETURNING *`, [name,hashedPass])
 return results.rows[0]
}

const loginUserDB = async(name)=>{
 const results = await pool.query(`
  SELECT * FROM profile WHERE username=$1
 `, [name])
 return results.rows[0]
}

const getProfileId= async(id,profile_id)=>{
 const result = await pool.query(`
  SELECT * FROM note WHERE public_id=$1
  AND profile_id=$2 
  `, [id,profile_id])
 return result.rows[0]
}

module.exports = { createUserTable, createUserDB, loginUserDB, getProfileId }