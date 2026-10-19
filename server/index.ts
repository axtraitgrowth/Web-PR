import express, { Request, Response } from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { db, initDatabase } from './db'
import { generateToken, requireAuth } from './auth'

dotenv.config()

// Initialize SQLite database schema
initDatabase()

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Request logger for diagnostic tracing
app.use((req, res, next) => {
  console.log(`[API ${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)
  next()
})


// Rate limiter for admin login (Security requirement: max 10 failed requests per 15 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' },
})


// Rate limiter for visitor tracking (protect against spamming events)
const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded.' },
})

// ----------------------------------------------------
// Public Visitor Analytics Tracking Endpoint
// ----------------------------------------------------
app.post(['/api/track', '/track'], trackingLimiter, (req: Request, res: Response) => {
  try {
    const {
      visitorId,
      eventType = 'page_view',
      stepNumber = 1,
      details,
      device = {},
    } = req.body

    if (!visitorId || typeof visitorId !== 'string') {
      res.status(400).json({ error: 'visitorId is required' })
      return
    }

    const now = new Date().toISOString()
    const deviceType = device.type || 'Desktop'
    const browser = device.browser || 'Unknown'
    const os = device.os || 'Unknown'
    const referrer = device.referrer || 'Direct'

    // Check if visitor already exists
    const existing = db.prepare('SELECT id, accepted_date, date_sealed, current_step FROM visitors WHERE id = ?').get(visitorId) as {
      id: string
      accepted_date: number
      date_sealed: number
      current_step: number
    } | undefined

    const isAccepted = (existing?.accepted_date === 1) || (stepNumber >= 2) ? 1 : 0
    const isSealed = (existing?.date_sealed === 1) || (stepNumber === 7) ? 1 : 0
    const highestStep = Math.max(existing?.current_step || 1, stepNumber)

    const chosenDate = details?.date || null
    const chosenTime = details?.time || null
    const chosenFood = details?.food || null

    if (!existing) {
      db.prepare(`
        INSERT INTO visitors (
          id, first_visit, last_visit, device_type, browser, os, referrer,
          current_step, accepted_date, chosen_date, chosen_time, chosen_food, date_sealed
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        visitorId,
        now,
        now,
        deviceType,
        browser,
        os,
        referrer,
        highestStep,
        isAccepted,
        chosenDate,
        chosenTime,
        chosenFood,
        isSealed
      )
    } else {
      // Update existing visitor
      db.prepare(`
        UPDATE visitors
        SET last_visit = ?,
            current_step = ?,
            accepted_date = ?,
            chosen_date = COALESCE(?, chosen_date),
            chosen_time = COALESCE(?, chosen_time),
            chosen_food = COALESCE(?, chosen_food),
            date_sealed = ?
        WHERE id = ?
      `).run(
        now,
        highestStep,
        isAccepted,
        chosenDate,
        chosenTime,
        chosenFood,
        isSealed,
        visitorId
      )
    }

    // Insert into events timeline
    db.prepare(`
      INSERT INTO events (visitor_id, event_type, step_number, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      visitorId,
      eventType,
      stepNumber,
      details ? JSON.stringify(details) : null,
      now
    )

    res.json({ success: true })
  } catch (err) {
    console.error('Tracking error:', err)
    res.status(500).json({ error: 'Internal tracking error' })
  }
})

// ----------------------------------------------------
// Admin Authentication Endpoints
// ----------------------------------------------------

/**
 * Admin Login
 */
app.post(['/api/admin/login', '/admin/login'], loginLimiter, (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' })
      return
    }

    const admin = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username) as {
      id: number
      username: string
      password_hash: string
    } | undefined

    if (!admin) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash)
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    // Update last login
    const now = new Date().toISOString()
    db.prepare('UPDATE admins SET last_login = ? WHERE id = ?').run(now, admin.id)

    // Issue signed JWT token
    const token = generateToken({ id: admin.id, username: admin.username })

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal login error' })
  }
})

/**
 * Verify current session
 */
app.get(['/api/admin/me', '/admin/me'], requireAuth, (req: Request, res: Response) => {
  res.json({ admin: req.admin })
})

/**
 * Admin Change Password
 */
app.post(['/api/admin/change-password', '/admin/change-password'], requireAuth, (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' })
      return
    }

    const admin = db.prepare('SELECT id, password_hash FROM admins WHERE id = ?').get(req.admin!.id) as {
      id: number
      password_hash: string
    } | undefined

    if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
      res.status(400).json({ error: 'Current password incorrect' })
      return
    }

    const salt = bcrypt.genSaltSync(10)
    const newHash = bcrypt.hashSync(newPassword, salt)
    db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(newHash, req.admin!.id)

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error('Password change error:', err)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

/**
 * Clear all visitor analytics (Wipes test/dummy records)
 */
app.post(['/api/admin/clear-analytics', '/admin/clear-analytics'], requireAuth, (_req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM events').run()
    db.prepare('DELETE FROM visitors').run()
    res.json({ success: true, message: 'All analytics records have been cleared.' })
  } catch (err) {
    console.error('Clear analytics error:', err)
    res.status(500).json({ error: 'Failed to clear analytics records' })
  }
})

// ----------------------------------------------------
// Protected Admin Analytics Dashboard API
// ----------------------------------------------------

app.get(['/api/admin/analytics', '/admin/analytics'], requireAuth, (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }

    let dateClauseEvents = ''
    let dateClauseVisitors = ''
    const paramsEvents: string[] = []
    const paramsVisitors: string[] = []

    if (startDate && endDate) {
      dateClauseEvents = 'WHERE created_at >= ? AND created_at <= ?'
      dateClauseVisitors = 'WHERE last_visit >= ? AND last_visit <= ?'
      paramsEvents.push(`${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`)
      paramsVisitors.push(`${startDate}T00:00:00.000Z`, `${endDate}T23:59:59.999Z`)
    } else if (startDate) {
      dateClauseEvents = 'WHERE created_at >= ?'
      dateClauseVisitors = 'WHERE last_visit >= ?'
      paramsEvents.push(`${startDate}T00:00:00.000Z`)
      paramsVisitors.push(`${startDate}T00:00:00.000Z`)
    }

    // 1. KPI Aggregates
    const totalPageViewsRow = db.prepare(`SELECT COUNT(*) as count FROM events ${dateClauseEvents}`).get(...paramsEvents) as { count: number }
    const totalVisitorsRow = db.prepare(`SELECT COUNT(DISTINCT visitor_id) as count FROM events ${dateClauseEvents}`).get(...paramsEvents) as { count: number }

    // Funnel Steps counts
    const funnelSteps = [
      { step: 1, label: 'Visited Invitation', count: 0 },
      { step: 2, label: 'Said YES! 🥹💖', count: 0 },
      { step: 3, label: 'Picked Date 📅', count: 0 },
      { step: 4, label: 'Picked Time ⏰', count: 0 },
      { step: 5, label: 'Chose Food 🍽️', count: 0 },
      { step: 6, label: 'Agreed to Terms 💌', count: 0 },
      { step: 7, label: 'Sealed Date 🎉', count: 0 },
    ]

    for (const stepObj of funnelSteps) {
      const row = db.prepare(`
        SELECT COUNT(DISTINCT visitor_id) as count
        FROM events
        ${dateClauseEvents ? `${dateClauseEvents} AND step_number >= ?` : 'WHERE step_number >= ?'}
      `).get(...paramsEvents, stepObj.step) as { count: number }
      stepObj.count = row.count
    }

    const acceptedCount = funnelSteps[1].count
    const sealedCount = funnelSteps[6].count
    const totalUnique = totalVisitorsRow.count || 0
    const acceptanceRate = totalUnique > 0 ? Math.round((acceptedCount / totalUnique) * 100) : 0
    const completionRate = totalUnique > 0 ? Math.round((sealedCount / totalUnique) * 100) : 0

    // 2. Device Breakdown
    const deviceBreakdown = db.prepare(`
      SELECT device_type, COUNT(*) as count
      FROM visitors
      ${dateClauseVisitors}
      GROUP BY device_type
    `).all(...paramsVisitors) as Array<{ device_type: string; count: number }>

    // 3. Browser Breakdown
    const browserBreakdown = db.prepare(`
      SELECT browser, COUNT(*) as count
      FROM visitors
      ${dateClauseVisitors}
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 5
    `).all(...paramsVisitors) as Array<{ browser: string; count: number }>

    // 4. Daily Visits Trend
    const dailyTrend = db.prepare(`
      SELECT SUBSTR(created_at, 1, 10) as date, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors
      FROM events
      ${dateClauseEvents}
      GROUP BY date
      ORDER BY date ASC
      LIMIT 30
    `).all(...paramsEvents) as Array<{ date: string; views: number; visitors: number }>

    // 5. Recent Detailed Visitor Activity
    const recentVisitors = db.prepare(`
      SELECT
        id, first_visit, last_visit, device_type, browser, os, referrer,
        current_step, accepted_date, chosen_date, chosen_time, chosen_food, date_sealed
      FROM visitors
      ${dateClauseVisitors}
      ORDER BY last_visit DESC
      LIMIT 50
    `).all(...paramsVisitors) as Array<any>

    // 6. Recent Event Logs
    const recentEvents = db.prepare(`
      SELECT e.id, e.visitor_id, e.event_type, e.step_number, e.details, e.created_at, v.device_type, v.browser
      FROM events e
      LEFT JOIN visitors v ON e.visitor_id = v.id
      ${dateClauseEvents.replace(/WHERE created_at/g, 'WHERE e.created_at')}
      ORDER BY e.created_at DESC
      LIMIT 50
    `).all(...paramsEvents) as Array<any>

    res.json({
      kpis: {
        totalPageViews: totalPageViewsRow.count,
        totalVisitors: totalUnique,
        acceptedCount,
        sealedCount,
        acceptanceRate,
        completionRate,
      },
      funnel: funnelSteps,
      deviceBreakdown,
      browserBreakdown,
      dailyTrend,
      recentVisitors,
      recentEvents,
    })
  } catch (err) {
    console.error('Analytics query error:', err)
    res.status(500).json({ error: 'Failed to retrieve analytics' })
  }
})

// Unmatched API routes return standard JSON error
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` })
})

// Serve built frontend assets if dist folder exists
const distPath = path.resolve(process.cwd(), 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.use((req: Request, res: Response, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'))
    }
    next()
  })
}

// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Server] Secure Admin & Analytics API running on http://127.0.0.1:${PORT}`)
})

