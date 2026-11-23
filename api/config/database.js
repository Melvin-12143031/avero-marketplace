import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

attachDatabasePool(pool);

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export default pool;
