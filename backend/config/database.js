import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const query = async (text, params) => {
  const start = Date.now();

  const res = await pool.query(text, params);

  const duration = Date.now() - start;

  console.log("executed query", { text, duration, rows: res.rowCount });

  return res;
};
