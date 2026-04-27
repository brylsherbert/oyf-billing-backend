import { pool } from "../config/db.js";

const createTables = async () => {
  const createBillsTableQuery = `
    CREATE TABLE IF NOT EXISTS bills (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      title TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      due_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid | pending | paid | overdue | failed | refunded
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )
  `;

  const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )
`;

  const createIndexForBillsQuery = `CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id)`;

  const createStripeEventsTableQuery = `
    CREATE TABLE IF NOT EXISTS stripe_events (
      id TEXT PRIMARY KEY
    )
  `;

  const createPaymentsTableQuery = `
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY,
      bill_id UUID NOT NULL,
      user_id UUID NOT NULL,
      provider TEXT NOT NULL,
      provider_payment_id TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      -- pending | succeeded | failed | refunded
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_bill
        FOREIGN KEY (bill_id)
        REFERENCES bills(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )
  `;

  try {
    // Add small delay to ensure pool is connected
    await new Promise(r => setTimeout(r, 500));
    
    await pool.query(createUsersTableQuery);
    await pool.query(createBillsTableQuery);
    await pool.query(createIndexForBillsQuery);
    await pool.query(createStripeEventsTableQuery);
    await pool.query(createPaymentsTableQuery);
    
  } catch (error) {
    throw error;
  }
};

export default createTables;
