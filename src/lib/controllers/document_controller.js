import crypto from "crypto";
const storage = require("../utils/storage");
const pdfParse = require("pdf-parse");
import {
  addDataDocument,
  getDocumentByIdDB,
  getDocumentsByProfileDB,
  deleteDocumentDB,
  storeExtractedText,
  storeExtractionError,
  getDocumentSummary,
  storeDocumentSummary,
  getDocumentTags,
  storeDocumentTags,
} from "../models/document_model";
import { getUserProfileDB } from "../models/profile_model";
import { generateFromGroq } from "../utils/groq_util";
import { buildPersonalization } from "../utils/personalization_util";
import { getChatHistory, addChatMessage } from "../models/chat_model";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE_BYTES) || 25 * 1024 * 1024;
const MAX_CONTEXT_CHARS = 12000;

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

const ensureExtractedText = (doc) => {
  if (!doc.extracted_text) {
    const err = new Error(
      doc.status === "failed"
        ? "This document couldn't be read. Try re-uploading it."
        : "This document is still being processed. Try again shortly."
    );
    err.status = 409;
    throw err;
  }
};

export const listDocuments = async (user, query) => {
  const { limit, offset } = parsePagination(query);
  const { rows, total } = await getDocumentsByProfileDB(user.public_id, limit, offset);
  return {
    meta: buildMeta(total, limit, offset, rows.length),
    data: rows,
  };
};

export const getDocument = async (user, id) => {
  const doc = await getDocumentByIdDB(id, user.public_id);
  if (!doc) throw new Error("Document not found");
  return doc;
};

export const uploadDocument = async (user, file, title) => {
  if (!file) throw new Error("No file uploaded");

  if (file.size > MAX_FILE_SIZE) {
    const err = new Error("File too large");
    err.status = 413;
    throw err;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalname = file.name;
  const size = file.size;
  const mimeType = file.type || "application/octet-stream";
  const finalTitle = title || originalname;

  const id = crypto.randomUUID();
  const storage_key = `${user.public_id}/${Date.now()}-${originalname}`;

  await storage.put(storage_key, buffer);

  try {
    await addDataDocument(id, user.public_id, finalTitle, originalname, size, storage_key, mimeType);
  } catch (err) {
    if (err.code === "23505") {
      const dupErr = new Error(`You already have a document titled "${finalTitle}". Try a different title.`);
      dupErr.status = 409;
      throw dupErr;
    }
    throw err;
  }

  try {
    let text = "";
    if (mimeType === "application/pdf") {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else {
      text = buffer.toString("utf-8");
    }
    await storeExtractedText(id, text);
  } catch (err) {
    await storeExtractionError(id, err.message || "Extraction failed");
  }

  return await getDocumentByIdDB(id, user.public_id);
};

export const deleteDocument = async (user, id) => {
  const doc = await deleteDocumentDB(id, user.public_id);
  if (!doc) throw new Error("Document not found");
  await storage.delete(doc.storage_key);
  return { message: "Deleted successfully" };
};

export const summarizeDocument = async (user, id, forceRefresh = false) => {
  const doc = await getDocumentByIdDB(id, user.public_id);
  if (!doc) throw new Error("Document not found");

  if (!forceRefresh) {
    const cached = await getDocumentSummary(id);
    if (cached) return { summary: cached, source: "cache" };
  }

  ensureExtractedText(doc);

  const profile = await getUserProfileDB(user.public_id);
  const personalization = buildPersonalization(profile);

  const completion = await generateFromGroq([
    { role: "system", content: `You are a helpful assistant that summarizes documents clearly and concisely. ${personalization}` },
    {
      role: "user",
      content: `Summarize this document in a short paragraph.\n\nTitle: ${doc.title}\n\nContent:\n${doc.extracted_text.slice(0, MAX_CONTEXT_CHARS)}`,
    },
  ]);

  const summary = completion.choices[0].message.content;
  await storeDocumentSummary(id, summary);
  return { summary, source: "generated" };
};

export const tagDocument = async (user, id) => {
  const doc = await getDocumentByIdDB(id, user.public_id);
  if (!doc) throw new Error("Document not found");

  const cached = await getDocumentTags(id);
  if (cached) return { tags: cached };

  ensureExtractedText(doc);

  const completion = await generateFromGroq([
    { role: "system", content: "You are a helpful assistant that generates tags for documents." },
    {
      role: "user",
      content: `Suggest 5 relevant tags for this document. Return ONLY a JSON array.\n\nTitle: ${doc.title}\n\nContent:\n${doc.extracted_text.slice(0, MAX_CONTEXT_CHARS)}`,
    },
  ]);

  const raw = completion.choices[0].message.content;
  let tags;
  try {
    tags = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    tags = [];
  }
  await storeDocumentTags(id, tags);
  return { tags };
};

export const askDocument = async (user, id, question) => {
  const doc = await getDocumentByIdDB(id, user.public_id);
  if (!doc) throw new Error("Document not found");
  ensureExtractedText(doc);

  const profile = await getUserProfileDB(user.public_id);
  const personalization = buildPersonalization(profile);

  const history = await getChatHistory("document", id);
  const historyMessages = history.map(m => ({ role: m.role, content: m.content }));

  await addChatMessage("document", id, "user", question);

  const completion = await generateFromGroq([
    {
      role: "system",
      content: `You are KalaRead, an assistant that helps someone understand a document they uploaded. Answer only using the document content below and general knowledge needed to explain it. ${personalization}\n\nDocument title: ${doc.title}\nDocument content:\n${doc.extracted_text.slice(0, MAX_CONTEXT_CHARS)}`,
    },
    ...historyMessages,
    { role: "user", content: question },
  ]);

  const answer = completion.choices[0].message.content;
  await addChatMessage("document", id, "assistant", answer);

  return { answer };
};

export const getDocumentChatHistory = async (id) => {
  return await getChatHistory("document", id)
}

module.exports = {
  listDocuments,
  getDocument,
  uploadDocument,
  deleteDocument,
  summarizeDocument,
  tagDocument,
  askDocument,
  getDocumentChatHistory
};