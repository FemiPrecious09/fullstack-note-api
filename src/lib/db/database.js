const { Pool } = require("pg");

const globalForDb = globalThis;

const pool = globalForDb.pool || new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// ❌ Remove this line:
// pool.on("connect", ()=>{ console.log("Database connected Successfully") })

module.exports = { pool };