import pkg from "pg";
import { config } from "dotenv";
const { Pool } = pkg;

config();

const pool = new Pool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const connectDB = async () => {
  let retries = 5;

  while (retries) {
    try {
      await pool.query("SELECT 1");
      console.log("Connected to the database");
      break;
    } catch (error) {
      console.log("Error connecting to the database, retrying.", error);
      retries--;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

export { connectDB, pool };
