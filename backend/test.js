//test.js
import { pool } from "./config/database.js";
import dotenv from "dotenv";

dotenv.config();
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to the database");
    client.release();
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
};
