import { pool } from "../../config/db.js";

export const insertPaymentToDB = async (payment) =>
{
    const { id, bill_id, user_id, provider, provider_payment_id, amount, status, created_at } = payment;
    const sqlQuery = `INSERT INTO payments (id, bill_id, user_id, provider, provider_payment_id, amount, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const result = await pool.query(sqlQuery, [id, bill_id, user_id, provider, provider_payment_id, amount, status, created_at]);
    return result.rows[0];
}

export const findPaymentByBillId = async (billId) => {
    const sqlQuery = `SELECT * FROM payments WHERE bill_id = $1 AND status = 'pending'`;
    const result = await pool.query(sqlQuery, [billId]);
    return result.rows[0];
}

export const updatePaymentStatusByBillId = async (billId, status) => {
    const sqlQuery = `UPDATE payments SET status = $1 WHERE bill_id = $2 AND status = 'pending'`;
    const result = await pool.query(sqlQuery, [status, billId]);
    return result.rowCount > 0;
}