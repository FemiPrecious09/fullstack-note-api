const { pool } = require("../db/database");

export const addDataDocument = async (
  id,
  profileId,
  title,
  originalname,
  size,
  storageKey,
  mimeType,
) => {
  const result = await pool.query(
    `
    INSERT INTO documents(id, profile_id, title, original_filename, mime_type, size_bytes, storage_key, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
    RETURNING *
  `,
    [id, profileId, title, originalname, mimeType, size, storageKey],
  );
  return result.rows[0];
};

export const getDocumentByIdDB = async (id, profile_id) => {
  const result = await pool.query(
    `SELECT * FROM documents
      WHERE id = $1
        AND profile_id = $2`,
    [id, profile_id],
  );
  return result.rows[0];
};

export const getDocumentsByProfileDB = async (profile_id, limit, offset) => {
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM documents WHERE profile_id = $1`,
    [profile_id],
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    `SELECT * FROM documents
      WHERE profile_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
    [profile_id, limit, offset],
  );

  return { rows: result.rows, total };
};

export const deleteDocumentDB = async (id, profile_id) => {
  const result = await pool.query(
    `DELETE FROM documents
      WHERE id = $1
        AND profile_id = $2
     RETURNING *`,
    [id, profile_id],
  );
  return result.rows[0];
};
export const storeExtractedText = async (id, text) => {
  const result = await pool.query(`
    UPDATE documents SET extracted_text=$1, status='ready', updated_at=NOW() WHERE id=$2 RETURNING *
  `, [text, id])
  return result.rows[0]
}

export const storeExtractionError = async (id, message) => {
  const result = await pool.query(`
    UPDATE documents SET extraction_error=$1, status='failed', updated_at=NOW() WHERE id=$2 RETURNING *
  `, [message, id])
  return result.rows[0]
}

export const getDocumentSummary = async (id) => {
  const result = await pool.query(`SELECT summary FROM documents WHERE id=$1`, [id])
  return result.rows[0]?.summary
}

export const storeDocumentSummary = async (id, summary) => {
  const result = await pool.query(`
    UPDATE documents SET summary=$1, updated_at=NOW() WHERE id=$2 RETURNING summary
  `, [summary, id])
  return result.rows[0]
}

export const getDocumentTags = async (id) => {
  const result = await pool.query(`SELECT tags FROM documents WHERE id=$1`, [id])
  return result.rows[0]?.tags
}

export const storeDocumentTags = async (id, tags) => {
  const result = await pool.query(`
    UPDATE documents SET tags=$1, updated_at=NOW() WHERE id=$2 RETURNING tags
  `, [tags, id])
  return result.rows[0]
}