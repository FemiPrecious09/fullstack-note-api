const fs = require("fs/promises")
const path = require("path")

const STORAGE_DIR = path.resolve(process.env.STORAGE_LOCAL_DIR || "./storage/uploads")

function resolveKey(key){
 const fullPath = path.resolve(STORAGE_DIR, key)
 if(fullPath !== STORAGE_DIR && !fullPath.startsWith(STORAGE_DIR + path.sep)){
  throw new Error(`Invalid Storage Key: ${key}`)
 }
 return fullPath
}

const put = async (key,buffer)=> {
 const fullPath = resolveKey(key);
 await fs.mkdir(path.dirname(fullPath), {recursive: true})
 await fs.writeFile(fullPath, buffer)
 return { key }
}

const get = async(key)=>{
 const fullPath = resolveKey(key);
 return fs.readFile(fullPath)
}

const deleteFile = async(key)=>{
 const fullPath = resolveKey(key);
 await fs.rm(fullPath, {force:true})
}

module.exports = {
 put,
 get,
 delete: deleteFile,
}