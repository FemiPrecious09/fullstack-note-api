require("dotenv").config()
const { createUserTable } = require("../src/lib/models/auth_model")
const { createNoteTable } = require("../src/lib/models/note_model")
const { createUserProfileTable } = require("../src/lib/models/profile_model")

const setUp = async()=>{
 try{
  await createUserTable()
  await createNoteTable()
  await createUserProfileTable()
  console.log("Table Created Successfully")
 }catch(err){
  console.error("Error",err)
 }
 process.exit();
}

setUp()