import { pool } from "../../config/db.js";

export const insertStripeEventToDB = async (eventId) =>
{
    const sqlQuery = `INSERT INTO stripe_events (id) VALUES ($1)`;
    const result = await pool.query(sqlQuery, [eventId]);
    return result.rowCount > 0;
}