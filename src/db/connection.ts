import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const { Client } = pg;
export const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
