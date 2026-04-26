import { pool } from "../../config/db.js";

export const healthCheck = async (req, res) => {
  try {
    await pool.query("SELECT 1");
    const result = await pool.query("SELECT current_database()");
    const { current_database } = result.rows[0];
    
    res.status(200).json({
      status: "ok",
      api: "running",
      database_status: "connected",
      database: current_database,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      api: "running",
      database: "disconnected",
      message: error.message,
    });
  }
};
