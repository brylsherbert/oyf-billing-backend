import { pool } from "../../config/db.js";

export const findAllBillsByUserId = async (userId, filters) => {
  const { clause, values } = buildWhereClause({ user_id: userId }, filters);
  const sqlQuery = `SELECT * FROM bills ${clause} ORDER BY due_date ASC`;

  const result = await pool.query(sqlQuery, values);
  return result.rows || [];
};

export const findBillById = async (billId) => {
  const sqlQuery = `SELECT * FROM bills WHERE id = $1`;

  const result = await pool.query(sqlQuery, [billId]);
  return result.rows[0];
};

export const insertBillToDB = async (bill) => {
  const { id: billId, user_id, title, amount, due_date, is_paid } = bill;
  const sqlQuery = `INSERT INTO bills (id, user_id, title, amount, due_date, is_paid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

  const result = await pool.query(sqlQuery, [
    billId,
    user_id,
    title,
    amount,
    due_date,
    is_paid,
  ]);
  return result.rows[0];
};

export const updateBillInDB = async (bill) => {
  const { id, title, amount, due_date, is_paid } = bill;
  const sqlQuery = `UPDATE bills SET title = $1, amount = $2, due_date = $3, is_paid = $4 WHERE id = $5 RETURNING *`;

  const result = await pool.query(sqlQuery, [title, amount, due_date, is_paid, id]);
  return result.rows[0];
};

export const deleteBillInDB = async (billId) => {
  const sqlQuery = `DELETE FROM bills WHERE id = $1`;

  const result = await pool.query(sqlQuery, [billId]);
  return result.rowCount > 0;
};

// Helper Function For Filters
function buildWhereClause(baseFilter = {}, filters = {}) {
  const conditions = [];
  const values = [];

  // base filters first
  Object.entries(baseFilter).forEach(([col, val]) => {
    if (val === undefined) return;

    values.push(val);
    conditions.push(`${col} = $${values.length}`);
  });

  // dynamic filters
  if (filters.startDate) {
    values.push(filters.startDate);
    conditions.push(`due_date >= $${values.length}`);
  }

  if (filters.endDate) {
    values.push(filters.endDate);
    conditions.push(`due_date <= $${values.length}`);
  }

  if (filters.minAmount !== undefined) {
    values.push(filters.minAmount);
    conditions.push(`amount >= $${values.length}`);
  }

  if (filters.maxAmount !== undefined) {
    values.push(filters.maxAmount);
    conditions.push(`amount <= $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }

  if (filters.isPaid !== undefined) {
    values.push(filters.isPaid);
    conditions.push(`is_paid = $${values.length}`);
  }

  return {
    clause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}
