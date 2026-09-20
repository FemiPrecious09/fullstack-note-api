require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: "localhost",
  database: "postgres",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function checkDB() {
  try {
    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'notes', 'documents', 'pgmigrations')
      ORDER BY table_name
    `);

    console.log("✅ Tables found:");
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // Check migrations
    const migrations = await pool.query("SELECT * FROM pgmigrations");
    console.log(`\n✅ ${migrations.rows.length} migrations applied`);

    await pool.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkDB();