// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — PostgreSQL connection + schema bootstrap
// ═══════════════════════════════════════════════════════════
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'asaka',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASS     || '',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// ── Create tables if they don't exist yet ─────────────────
export async function initDB() {
  // ── Order ID sequence — guarantees unique IDs across all sessions ──
  await pool.query(`
    CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1101 INCREMENT 1;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id                TEXT PRIMARY KEY,
      customer          TEXT,
      items             TEXT,
      total             TEXT,
      status            TEXT DEFAULT 'new',
      mode              TEXT,
      platform          TEXT,
      phone             TEXT,
      address           TEXT,
      gps_link          TEXT,
      pickup_time       TEXT,
      payment_method    TEXT,
      tip               TEXT,
      cancel_window_end BIGINT,
      payload           JSONB,
      raw_items         JSONB,
      created_at        TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id              SERIAL PRIMARY KEY,
      name            TEXT,
      email           TEXT UNIQUE,
      phone           TEXT,
      password        TEXT,
      points          INTEGER DEFAULT 0,
      total_orders    INTEGER DEFAULT 0,
      total_spent     NUMERIC DEFAULT 0,
      order_history   JSONB DEFAULT '[]',
      favorites       JSONB DEFAULT '[]',
      coupons         JSONB DEFAULT '[]',
      saved_addresses JSONB DEFAULT '[]',
      avatar_url      TEXT,
      avatar_emoji    TEXT,
      joined_date     TEXT,
      oauth_provider  TEXT,
      oauth_id        TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    DO $$ 
    BEGIN 
      BEGIN
        ALTER TABLE customers ADD COLUMN oauth_provider TEXT;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END;
      BEGIN
        ALTER TABLE customers ADD COLUMN oauth_id TEXT;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT DEFAULT 'Staff',
      status     TEXT DEFAULT 'Active',
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Offers / Promotions ──────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS offers (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      description      TEXT,
      discount_percent INTEGER DEFAULT 0,
      is_active        BOOLEAN DEFAULT TRUE,
      start_date       DATE,
      end_date         DATE,
      holiday_type     TEXT DEFAULT 'custom',
      slides           JSONB DEFAULT '[]',
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Menu Categories ────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      emoji      TEXT,
      image      TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Menu Items ─────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT,
      price       NUMERIC NOT NULL DEFAULT 0,
      description TEXT,
      image       TEXT,
      available   BOOLEAN DEFAULT TRUE,
      extras      JSONB DEFAULT '[]',
      allergens   JSONB DEFAULT '[]',
      tags        JSONB DEFAULT '[]',
      kcal        INTEGER,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Inventory ──────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      category     TEXT,
      quantity     NUMERIC DEFAULT 0,
      unit         TEXT DEFAULT 'kg',
      min_stock    NUMERIC DEFAULT 0,
      price        NUMERIC DEFAULT 0,
      supplier     TEXT,
      last_updated TIMESTAMPTZ DEFAULT NOW(),
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Avis / Reviews ─────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS avis (
      id         BIGSERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      stars      INTEGER DEFAULT 5,
      text       TEXT,
      date       TEXT,
      published  BOOLEAN DEFAULT TRUE,
      images     JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Seed the default superadmin if no staff exist yet
  const { rowCount } = await pool.query('SELECT 1 FROM staff LIMIT 1');
  if (rowCount === 0) {
    await pool.query(`
      INSERT INTO staff (name, email, password, role, status)
      VALUES ('Admin', 'admin@asakasushi.ma', '123123123', 'Superadmin', 'Active')
      ON CONFLICT DO NOTHING
    `);
    console.log('👤 Default admin account created (email: admin@asakasushi.ma / password: 123123123)');
  }

  console.log('✅ Database ready');
}
