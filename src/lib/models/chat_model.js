const { pool } = require("../db/database")

const getChatHistory = async (resourceType, resourceId) => {
  const result = await pool.query(`
    SELECT role, content, created_at FROM chat_message
    WHERE resource_type=$1 AND resource_id=$2
    ORDER BY created_at ASC
  `, [resourceType, resourceId])
  return result.rows
}

const addChatMessage = async (resourceType, resourceId, role, content) => {
  const result = await pool.query(`
    INSERT INTO chat_message(resource_type, resource_id, role, content)
    VALUES ($1,$2,$3,$4) RETURNING role, content, created_at
  `, [resourceType, resourceId, role, content])
  return result.rows[0]
}

const getRecentChats = async (profileId, limit = 10) => {
  const result = await pool.query(`
    SELECT * FROM (
      SELECT 'note' as type, n.public_id as id, n.title as title, MAX(cm.created_at) as last_message_at
      FROM chat_message cm
      JOIN note n ON n.public_id = cm.resource_id AND cm.resource_type = 'note'
      WHERE n.profile_id = $1
      GROUP BY n.public_id, n.title

      UNION ALL

      SELECT 'document' as type, d.id::text as id, d.title as title, MAX(cm.created_at) as last_message_at
      FROM chat_message cm
      JOIN documents d ON d.id::text = cm.resource_id AND cm.resource_type = 'document'
      WHERE d.profile_id = $1
      GROUP BY d.id, d.title
    ) combined
    ORDER BY last_message_at DESC
    LIMIT $2
  `, [profileId, limit])
  return result.rows
}

module.exports = { getChatHistory, addChatMessage, getRecentChats }