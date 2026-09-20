require("dotenv").config()
const { createUserTable } = require("../src/lib/models/auth_model")
const { createNoteTable } = require("../src/lib/models/note_model")

const setUp = async()=>{
 try{
  await createUserTable()
  await createNoteTable()
  console.log("Table Created Successfully")
 }catch(err){
  console.error("Error",err)
 }
 process.exit();
}

setUp()