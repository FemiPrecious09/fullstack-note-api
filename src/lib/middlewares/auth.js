import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken';
import { getProfileId } from '../models/auth_model';
import { getProfileNote } from '../models/note_model';

export const authorize = async ()=>{
 const cookieStore = await cookies()
 const token = cookieStore.get('token')?.value; //if user exist get the value instead don't do .value return undefined
 if(!token){
  throw new Error("Unathorized Access") // DON'T USE: return NextResponse.json({message : "Unauthorized access"}, {status: 401}) //It will keep running
 }
 try{
  const user = jwt.verify(token, process.env.MY_SECRET_KEY)
  return user
 }catch(err){
  throw new Error("Invalid Token") // same thing here
 }
}

export const authorizeOwner = async (user,id)=>{
 try{
  const result = await getProfileId(id,user.public_id)
  if(!result){
   throw new Error("Invalid Id")
  }
 }catch(err){
  throw new Error("Unathorized Access")
 }
}

export const authorizeRead = async (user)=>{
 try{
  const result = await getProfileNote(user.public_id)
  if(!result){
   throw new Error("Invalid Id")
  }
 }catch(err){
  throw new Error("Unathorized Access")
 }
}
