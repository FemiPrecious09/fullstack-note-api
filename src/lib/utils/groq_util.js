import groq from "../../../config/groq"
const sleep = (ms)=> new Promise(resolve => setTimeout(resolve,ms))

export const generateFromGroq = async (messages,entries = 3)=>{
 for(let i = 0; i < entries; i++){
  try{
   return await groq.chat.completions.create({
    messages,
    model: process.env.MODEL
   })
  }catch(err){
   const isRetryable = !err.status || err.status === 429 || err.status >= 500
   if (!isRetryable || i === entries - 1) {
    throw err
   } 
   const ms = 2 ** i * 1000
   await sleep(ms)
  }
 }
}
