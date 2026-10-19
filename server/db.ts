import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
import bcrypt from 'bcryptjs'

const require = createRequire(import.meta.url)

const isVercel = !!process.env.VERCEL
let sqliteDb: any = null
let useSqlite = false

if (!isVercel) {
  try {
    const Database = require('better-sqlite3')
    const dataDir = path.resolve(process.cwd(), 'server', 'data')
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true })
      } catch {}
    }
    const dbPath = path.join(dataDir, 'analytics.db')
    sqliteDb = new Database(dbPath)
    try {
      sqliteDb.pragma('journal_mode = WAL')
      sqliteDb.pragma('foreign_keys = ON')
    } catch {}
    useSqlite = true
  } catch (err: any) {
    console.warn('[Database] better-sqlite3 unavailable, using universal memory/file store:', err?.message)
    useSqlite = false
  }
}

// ---------------------------------------------------------------------------
// Universal Serverless / JSON Fallback Store
// ---------------------------------------------------------------------------
interface UniversalAdmin {
  id: number
  username: string
  password_hash: string
  created_at: string
  last_login?: string
}

interface UniversalVisitor {
  id: string
  name: string | null
  first_visit: string
  last_visit: string
  device_type: string
  browser: string
  os: string
  referrer: string
  current_step: number
  accepted_date: number
  chosen_date: string | null
  chosen_time: string | null
  chosen_food: string | null
  date_sealed: number
}

interface UniversalEvent {
  id: number
  visitor_id: string
  event_type: string
  step_number: number
  details: string | null
  created_at: string
}

interface UniversalStoreData {
  admins: UniversalAdmin[]
  visitors: UniversalVisitor[]
  events: UniversalEvent[]
}

const memoryData: UniversalStoreData = {
  admins: [],
  visitors: [],
  events: [],
}

function getStoreFilePath(): string {
  if (fs.existsSync('/tmp')) {
    return '/tmp/romantic_analytics.json'
  }
  const localDir = path.resolve(process.cwd(), 'server', 'data')
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true })
    } catch {}
  }
  return path.join(localDir, 'analytics.json')
}

function loadUniversalData() {
  try {
    const filePath = getStoreFilePath()
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed.admins)) memoryData.admins = parsed.admins
      if (Array.isArray(parsed.visitors)) memoryData.visitors = parsed.visitors
      if (Array.isArray(parsed.events)) memoryData.events = parsed.events
    }
  } catch {
    // Fail silently, use memoryData
  }
}

function saveUniversalData() {
  try {
    const filePath = getStoreFilePath()
    fs.writeFileSync(filePath, JSON.stringify(memoryData, null, 2), 'utf-8')
  } catch {
    // Fail silently if disk is read-only
  }
}

function createUniversalStatement(sql: string) {
  const normalized = sql.replace(/\s+/g, ' ').trim()

  return {
    get(...params: any[]): any {
      loadUniversalData()

      // 1. SELECT id FROM admins LIMIT 1
      if (/SELECT id FROM admins/i.test(normalized)) {
        return memoryData.admins[0] ? { id: memoryData.admins[0].id } : undefined
      }

      // 2. SELECT id, username, password_hash FROM admins WHERE username = ?
      if (/SELECT .* FROM admins WHERE username = \?/i.test(normalized)) {
        const username = params[0]
        const admin = memoryData.admins.find((a) => a.username === username)
        return admin ? { ...admin } : undefined
      }

      // 3. SELECT id, password_hash FROM admins WHERE id = ?
      if (/SELECT .* FROM admins WHERE id = \?/i.test(normalized)) {
        const id = Number(params[0])
        const admin = memoryData.admins.find((a) => a.id === id)
        return admin ? { ...admin } : undefined
      }

      // 4. SELECT id, accepted_date, date_sealed, current_step FROM visitors WHERE id = ?
      if (/SELECT .* FROM visitors WHERE id = \?/i.test(normalized)) {
        const id = params[0]
        const visitor = memoryData.visitors.find((v) => v.id === id)
        return visitor ? { ...visitor } : undefined
      }

      // 5. SELECT COUNT(*) as count FROM events WHERE ...
      if (/SELECT COUNT\(\*\) as count FROM events/i.test(normalized)) {
        let list = memoryData.events
        if (params.length === 2) {
          const start = params[0]
          const end = params[1]
          list = list.filter((e) => e.created_at >= start && e.created_at <= end)
        } else if (params.length === 1) {
          const start = params[0]
          list = list.filter((e) => e.created_at >= start)
        }
        return { count: list.length }
      }

      // 6. SELECT COUNT(DISTINCT visitor_id) as count FROM events WHERE ...
      if (/SELECT COUNT\(DISTINCT visitor_id\) as count FROM events/i.test(normalized)) {
        let list = memoryData.events
        const eventTypeMatch = normalized.match(/event_type = '([^']+)'/i)
        if (eventTypeMatch) {
          const type = eventTypeMatch[1]
          list = list.filter((e) => e.event_type === type)
        }
        const stepMatch = normalized.match(/step_number >= (\d+)/i)
        if (stepMatch) {
          const minStep = Number(stepMatch[1])
          list = list.filter((e) => e.step_number >= minStep)
        }

        if (params.length === 2) {
          const start = params[0]
          const end = params[1]
          list = list.filter((e) => e.created_at >= start && e.created_at <= end)
        } else if (params.length === 1) {
          const start = params[0]
          list = list.filter((e) => e.created_at >= start)
        }

        const unique = new Set(list.map((e) => e.visitor_id))
        return { count: unique.size }
      }

      return undefined
    },

    all(...params: any[]): any[] {
      loadUniversalData()

      // 1. Device Breakdown: SELECT device_type, COUNT(*) as count FROM visitors ... GROUP BY device_type
      if (/GROUP BY device_type/i.test(normalized)) {
        let list = memoryData.visitors
        if (params.length === 2) {
          list = list.filter((v) => v.last_visit >= params[0] && v.last_visit <= params[1])
        } else if (params.length === 1) {
          list = list.filter((v) => v.last_visit >= params[0])
        }
        const map: Record<string, number> = {}
        for (const v of list) {
          map[v.device_type] = (map[v.device_type] || 0) + 1
        }
        return Object.entries(map).map(([device_type, count]) => ({ device_type, count }))
      }

      // 2. Browser Breakdown: SELECT browser, COUNT(*) as count FROM visitors ... GROUP BY browser
      if (/GROUP BY browser/i.test(normalized)) {
        let list = memoryData.visitors
        if (params.length === 2) {
          list = list.filter((v) => v.last_visit >= params[0] && v.last_visit <= params[1])
        } else if (params.length === 1) {
          list = list.filter((v) => v.last_visit >= params[0])
        }
        const map: Record<string, number> = {}
        for (const v of list) {
          map[v.browser] = (map[v.browser] || 0) + 1
        }
        return Object.entries(map).map(([browser, count]) => ({ browser, count }))
      }

      // 3. Daily Trend: SELECT substr(created_at, 1, 10) as date, ... GROUP BY date
      if (/GROUP BY date/i.test(normalized)) {
        let list = memoryData.events
        if (params.length === 2) {
          list = list.filter((e) => e.created_at >= params[0] && e.created_at <= params[1])
        } else if (params.length === 1) {
          list = list.filter((e) => e.created_at >= params[0])
        }
        const dateMap: Record<string, { views: number; visitors: Set<string> }> = {}
        for (const e of list) {
          const d = e.created_at.slice(0, 10)
          if (!dateMap[d]) dateMap[d] = { views: 0, visitors: new Set() }
          dateMap[d].views++
          dateMap[d].visitors.add(e.visitor_id)
        }
        return Object.entries(dateMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, val]) => ({ date, views: val.views, visitors: val.visitors.size }))
      }

      // 4. Recent Visitors: SELECT ... FROM visitors ... ORDER BY last_visit DESC LIMIT 50
      if (/FROM visitors/i.test(normalized) && /ORDER BY last_visit DESC/i.test(normalized)) {
        let list = [...memoryData.visitors]
        if (params.length === 2) {
          list = list.filter((v) => v.last_visit >= params[0] && v.last_visit <= params[1])
        } else if (params.length === 1) {
          list = list.filter((v) => v.last_visit >= params[0])
        }
        return list.sort((a, b) => b.last_visit.localeCompare(a.last_visit)).slice(0, 50)
      }

      // 5. Recent Events: SELECT ... FROM events e LEFT JOIN visitors v ... ORDER BY e.created_at DESC LIMIT 50
      if (/FROM events/i.test(normalized) && /ORDER BY/i.test(normalized)) {
        let list = [...memoryData.events]
        if (params.length === 2) {
          list = list.filter((e) => e.created_at >= params[0] && e.created_at <= params[1])
        } else if (params.length === 1) {
          list = list.filter((e) => e.created_at >= params[0])
        }
        const visitorMap = new Map(memoryData.visitors.map((v) => [v.id, v]))
        return list
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 50)
          .map((e) => {
            const v = visitorMap.get(e.visitor_id)
            return {
              id: e.id,
              visitor_id: e.visitor_id,
              event_type: e.event_type,
              step_number: e.step_number,
              details: e.details,
              created_at: e.created_at,
              device_type: v?.device_type || 'Unknown',
              browser: v?.browser || 'Unknown',
            }
          })
      }

      return []
    },

    run(...params: any[]) {
      loadUniversalData()

      // 1. UPDATE admins SET last_login = ? WHERE id = ?
      if (/UPDATE admins SET last_login = \? WHERE id = \?/i.test(normalized)) {
        const last_login = params[0]
        const id = Number(params[1])
        const admin = memoryData.admins.find((a) => a.id === id)
        if (admin) {
          admin.last_login = last_login
          saveUniversalData()
        }
        return { changes: 1 }
      }

      // 2. UPDATE admins SET password_hash = ? WHERE id = ?
      if (/UPDATE admins SET password_hash = \? WHERE id = \?/i.test(normalized)) {
        const password_hash = params[0]
        const id = Number(params[1])
        const admin = memoryData.admins.find((a) => a.id === id)
        if (admin) {
          admin.password_hash = password_hash
          saveUniversalData()
        }
        return { changes: 1 }
      }

      // 3. INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)
      if (/INSERT INTO admins/i.test(normalized)) {
        const [username, password_hash, created_at] = params
        const newId = memoryData.admins.length ? Math.max(...memoryData.admins.map((a) => a.id)) + 1 : 1
        memoryData.admins.push({ id: newId, username, password_hash, created_at })
        saveUniversalData()
        return { changes: 1 }
      }

      // 4. INSERT INTO visitors (...) VALUES (...)
      if (/INSERT INTO visitors/i.test(normalized)) {
        let id, name = null, first_visit, last_visit, device_type, browser, os, referrer,
            current_step, accepted_date, chosen_date, chosen_time, chosen_food, date_sealed
        if (params.length >= 14) {
          [id, name, first_visit, last_visit, device_type, browser, os, referrer,
           current_step, accepted_date, chosen_date, chosen_time, chosen_food, date_sealed] = params
        } else {
          [id, first_visit, last_visit, device_type, browser, os, referrer,
           current_step, accepted_date, chosen_date, chosen_time, chosen_food, date_sealed] = params
        }
        memoryData.visitors.push({
          id,
          name: name || null,
          first_visit,
          last_visit,
          device_type,
          browser,
          os,
          referrer,
          current_step: Number(current_step) || 1,
          accepted_date: Number(accepted_date) || 0,
          chosen_date: chosen_date || null,
          chosen_time: chosen_time || null,
          chosen_food: chosen_food || null,
          date_sealed: Number(date_sealed) || 0
        })
        saveUniversalData()
        return { changes: 1 }
      }

      // 5. UPDATE visitors SET ... WHERE id = ?
      if (/UPDATE visitors/i.test(normalized)) {
        const visitorId = params[params.length - 1]
        const visitor = memoryData.visitors.find((v) => v.id === visitorId)
        if (visitor) {
          if (params.length >= 9) {
            const [name, now, highestStep, isAccepted, chosenDate, chosenTime, chosenFood, isSealed] = params
            if (name) visitor.name = name
            visitor.last_visit = now
            visitor.current_step = Number(highestStep) || visitor.current_step
            visitor.accepted_date = Number(isAccepted) || visitor.accepted_date
            if (chosenDate) visitor.chosen_date = chosenDate
            if (chosenTime) visitor.chosen_time = chosenTime
            if (chosenFood) visitor.chosen_food = chosenFood
            visitor.date_sealed = Number(isSealed) || visitor.date_sealed
          } else {
            const [now, highestStep, isAccepted, chosenDate, chosenTime, chosenFood, isSealed] = params
            visitor.last_visit = now
            visitor.current_step = Number(highestStep) || visitor.current_step
            visitor.accepted_date = Number(isAccepted) || visitor.accepted_date
            if (chosenDate) visitor.chosen_date = chosenDate
            if (chosenTime) visitor.chosen_time = chosenTime
            if (chosenFood) visitor.chosen_food = chosenFood
            visitor.date_sealed = Number(isSealed) || visitor.date_sealed
          }
          saveUniversalData()
        }
        return { changes: 1 }
      }

      // 6. INSERT INTO events (visitor_id, event_type, step_number, details, created_at)
      if (/INSERT INTO events/i.test(normalized)) {
        const [visitor_id, event_type, step_number, details, created_at] = params
        const newId = memoryData.events.length ? Math.max(...memoryData.events.map((e) => e.id)) + 1 : 1
        memoryData.events.push({
          id: newId,
          visitor_id,
          event_type,
          step_number: Number(step_number) || 1,
          details: details || null,
          created_at
        })
        saveUniversalData()
        return { changes: 1 }
      }

      // 7. DELETE FROM events
      if (/DELETE FROM events/i.test(normalized)) {
        memoryData.events = []
        saveUniversalData()
        return { changes: 1 }
      }

      // 8. DELETE FROM visitors
      if (/DELETE FROM visitors/i.test(normalized)) {
        memoryData.visitors = []
        saveUniversalData()
        return { changes: 1 }
      }

      return { changes: 0 }
    }
  }
}

// Universal database export
export const db = {
  prepare(sql: string) {
    if (useSqlite && sqliteDb) {
      return sqliteDb.prepare(sql)
    }
    return createUniversalStatement(sql)
  },
  exec(sql: string) {
    if (useSqlite && sqliteDb) {
      return sqliteDb.exec(sql)
    }
    loadUniversalData()
    // No-op for schema creation in memory
    return
  },
  pragma(cmd: string) {
    if (useSqlite && sqliteDb) {
      return sqliteDb.pragma(cmd)
    }
    return
  }
}

/**
 * Initialize database schema and ensure default admin account exists
 */
export function initDatabase() {
  if (useSqlite && sqliteDb) {
    // 1. Admin users table
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_login TEXT
      );
    `)

    // 2. Visitors table
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY,
        name TEXT,
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
    try {
      sqliteDb.exec('ALTER TABLE visitors ADD COLUMN name TEXT;')
    } catch {}

    // 3. Visitor events log table
    sqliteDb.exec(`
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
  } else {
    loadUniversalData()
  }

  // Ensure default admin account exists in whatever store is active
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
