import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'server', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'analytics.db')
export const db = new Database(dbPath)

// Enable WAL mode for high performance and durability
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

/**
 * Initialize database schema
 */
export function initDatabase() {
  // 1. Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_login TEXT
    );
  `)

  // 2. Visitors table (Privacy-preserving: stores anonymous session IDs & high-level device info)
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      first_visit TEXT NOT NULL,
      last_visit TEXT NOT NULL,
      device_type TEXT NOT NULL,
      browser TEXT NOT NULL,
      os TEXT NOT NULL,
      referrer TEXT,
      current_step INTEGER DEFAULT 1,
      accepted_date INTEGER DEFAULT 0,
      chosen_date TEXT,
      chosen_time TEXT,
      chosen_food TEXT,
      date_sealed INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors(last_visit);
  `)

  // 3. Visitor events log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      step_number INTEGER NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON events(visitor_id);
  `)

  // 4. Seed default admin account if no admin exists
  const existingAdmin = db.prepare('SELECT id FROM admins LIMIT 1').get()
  if (!existingAdmin) {
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin'
    const defaultPassword = process.env.ADMIN_PASSWORD || 'AdminPassword!2026'
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(defaultPassword, salt)
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO admins (username, password_hash, created_at)
      VALUES (?, ?, ?)
    `).run(defaultUsername, hash, now)

    console.log(`[Database] Initialized default admin account: "${defaultUsername}"`)
  }
}
