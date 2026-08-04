import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id UUID PRIMARY KEY,
      plate_number TEXT NOT NULL,
      model TEXT,
      brand TEXT,
      year INTEGER,
      status TEXT DEFAULT 'active',
      cost_center TEXT,
      asset_number TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log("Database ready ✅");
}
