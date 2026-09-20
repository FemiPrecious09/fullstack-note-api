const { pool } = require("../db/database");

export const addDataDocument = async (
  id,
  profileId,
  title,
  originalname,
  size,
  storageKey,
) => {
  const result = await pool.query(
    `
    INSERT INTO documents(id, profile_id, title, original_filename, mime_type, size_bytes, storage_key, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
    RETURNING *
  `,
    [id, profileId, title, originalname, "application/pdf", size, storageKey],
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

