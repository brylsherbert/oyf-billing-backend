import { pool } from "../../config/db.js";

export const insertUserToDB = async (user) => {
  const { id, email, username, password } = user;
  const sqlQuery = `INSERT INTO users (id, email, username, password) VALUES ($1, $2, $3, $4) RETURNING *`;

  const result = await pool.query(sqlQuery, [id, email, username, password]);
  return result.rows[0];
}

export const findAllUsers = async () => {
  const sqlQuery = `SELECT * FROM users ORDER BY created_at DESC`;

  const result = await pool.query(sqlQuery);
  return result.rows;
}

export const findUserByEmail = async (userEmail) => {
  const sqlQuery = `SELECT * FROM users WHERE email = $1`;

  const result = await pool.query(sqlQuery, [userEmail]);
  return result.rows[0];
}

export const findUserById = async (userId) => {
  const sqlQuery = `SELECT * FROM users WHERE id = $1`;

  const result = await pool.query(sqlQuery, [userId]);
  return result.rows[0];
}