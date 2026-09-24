const { pool } = require("../db/database")

const createUserProfileTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profile(
      id SERIAL PRIMARY KEY,
      profile_id UUID UNIQUE NOT NULL REFERENCES profile(public_id) ON DELETE CASCADE,
      occupation TEXT NOT NULL,
      industry TEXT NOT NULL,
      hobbies TEXT NOT NULL,
      current_learning TEXT NOT NULL,
      learning_style TEXT NOT NULL,
      goal TEXT NOT NULL,
      language_preference TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)
}

const getUserProfileDB = async (profileId) => {
  const result = await pool.query(`
    SELECT * FROM user_profile WHERE profile_id = $1
  `, [profileId])
  return result.rows[0]
}

const upsertUserProfileDB = async (profileId, fields) => {
  const {
    occupation,
    industry,
    hobbies,
    current_learning,
    learning_style,
    goal,
    language_preference
  } = fields

  const result = await pool.query(`
    INSERT INTO user_profile
      (profile_id, occupation, industry, hobbies, current_learning, learning_style, goal, language_preference)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (profile_id) DO UPDATE SET
      occupation = EXCLUDED.occupation,
      industry = EXCLUDED.industry,
      hobbies = EXCLUDED.hobbies,
      current_learning = EXCLUDED.current_learning,
      learning_style = EXCLUDED.learning_style,
      goal = EXCLUDED.goal,
      language_preference = EXCLUDED.language_preference,
      updated_at = NOW()
    RETURNING *
  `, [profileId, occupation, industry, hobbies, current_learning, learning_style, goal, language_preference])

  return result.rows[0]
}

module.exports = { createUserProfileTable, getUserProfileDB, upsertUserProfileDB }