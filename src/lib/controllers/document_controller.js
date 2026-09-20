import crypto from "crypto";
const storage = require("../utils/storage");
import { addDataDocument,getDocumentByIdDB, getDocumentsByProfileDB, deleteDocumentDB } from "../models/document_model";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE_BYTES) || 25 * 1024 * 1024; // 25 MB

const parsePagination = (query) => {
  let limit = parseInt(query.limit, 10);
  let offset = parseInt(query.offset, 10);
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  if (isNaN(offset) || offset < 0) offset = 0;
  return { limit, offset };
};

const buildMeta = (total, limit, offset, returned) => ({
  total, limit, offset, returned,
  has_more: offset + limit < total,
});

// 1. LIST DOCUMENTS (Pass user and query object)
export const listDocuments = async (user, query) => {
  const { limit, offset } = parsePagination(query);
  const { rows, total } = await getDocumentsByProfileDB(user.public_id, limit, offset);

  return {
    meta: buildMeta(total, limit, offset, rows.length),
    data: rows,
  };
};

// 2. GET DOCUMENT
export const getDocument = async (user, id) => {
  const doc = await getDocumentByIdDB(id, user.public_id);
  if (!doc) throw new Error("Document not found");
  return doc;
};

// 3. UPLOAD DOCUMENT (Next.js passes a native File object, not req.file)
export const uploadDocument = async (user, file, title) => {
  if (!file) throw new Error("No file uploaded");

  // Replaces Multer's file size limit check
  if (file.size > MAX_FILE_SIZE) {
    const err = new Error("File too large");
    err.status = 413; // Payload Too Large
    throw err;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalname = file.name;
  const size = file.size;
  
  const id = crypto.randomUUID();
  const storage_key = `${user.public_id}/${Date.now()}-${originalname}`;

  await storage.put(storage_key, buffer);

  const doc = await addDataDocument(
    id, user.public_id, title || originalname, originalname, size, storage_key
  );

  return doc;
};

// 4. DELETE DOCUMENT
export const deleteDocument = async (user, id) => {
  const doc = await deleteDocumentDB(id, user.public_id);
  if (!doc) throw new Error("Document not found");
  
  await storage.delete(doc.storage_key);
  return { message: "Deleted successfully" };
};

module.exports = { listDocuments, getDocument, uploadDocument, deleteDocument };