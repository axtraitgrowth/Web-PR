import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'romantic-date-admin-secret-key-2026-unbreakable-token'
const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword!2026'

// Pre-hash default credentials for instant and bulletproof zero-failure authentication
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(DEFAULT_PASSWORD, 10)

interface VisitorRecord {
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

interface EventRecord {
  id: number
  visitor_id: string
  event_type: string
  step_number: number
  details: string | null
  created_at: string
}

interface StoreState {
  adminPasswordHash?: string
  lastLogin?: string
  visitors: VisitorRecord[]
  events: EventRecord[]
}

const state: StoreState = {
  adminPasswordHash: undefined,
  lastLogin: undefined,
  visitors: [],
  events: [],
}

function getStoragePath(): string {
  if (fs.existsSync('/tmp')) {
    return '/tmp/romantic_date_analytics.json'
  }
  const localDir = path.resolve(process.cwd(), 'server', 'data')
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true })
    } catch {}
  }
  return path.join(localDir, 'analytics.json')
}

function loadStateFromDisk() {
  try {
    const filePath = getStoragePath()
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (parsed.adminPasswordHash) state.adminPasswordHash = parsed.adminPasswordHash
      if (parsed.lastLogin) state.lastLogin = parsed.lastLogin
      if (Array.isArray(parsed.visitors)) state.visitors = parsed.visitors
      if (Array.isArray(parsed.events)) state.events = parsed.events
    }
  } catch {
    // Fail gracefully, state remains in memory
  }
}

function saveStateToDisk() {
  try {
    const filePath = getStoragePath()
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8')
  } catch {
    // Fail gracefully if read-only
  }
}

// Initial load
loadStateFromDisk()

function sendJson(res: any, status: number, data: any) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.end(JSON.stringify(data))
}

async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body)
      } catch {
        return {}
      }
    }
    return req.body
  }

  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk: any) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
    req.on('error', () => {
      resolve({})
    })
  })
}

function verifyToken(req: any): { id: number; username: string } | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string }
  } catch {
    return null
  }
}

/**
 * Native Vercel Serverless Function & HTTP Handler
 */
export default async function handler(req: any, res: any) {
  const method = (req.method || 'GET').toUpperCase()
  const rawUrl = req.url || '/'
  const invokePath = (req.headers?.['x-invoke-path'] || req.headers?.['x-matched-path'] || '') as string
  const checkUrl = `${rawUrl} ${invokePath}`.toLowerCase()

  // 1. CORS Preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.end()
    return
  }

  try {
    loadStateFromDisk()

    // 2. Health check
    if (checkUrl.includes('/health')) {
      return sendJson(res, 200, { status: 'healthy', time: new Date().toISOString() })
    }

    // 3. Admin Login: POST /api/admin/login
    if (checkUrl.includes('/admin/login') || checkUrl.includes('/login')) {
      if (method !== 'POST') {
        return sendJson(res, 405, { error: 'Method not allowed' })
      }

      const body = await parseBody(req)
      const username = body?.username?.trim() || ''
      const password = body?.password || ''

      if (!username || !password) {
        return sendJson(res, 400, { error: 'Username and password are required' })
      }

      const currentHash = state.adminPasswordHash || DEFAULT_PASSWORD_HASH

      if (username !== DEFAULT_USERNAME) {
        return sendJson(res, 401, { error: 'Invalid username or password' })
      }

      const isMatch = bcrypt.compareSync(password, currentHash)
      if (!isMatch) {
        return sendJson(res, 401, { error: 'Invalid username or password' })
      }

      // Record login time
      state.lastLogin = new Date().toISOString()
      saveStateToDisk()

      // Generate signed JWT token
      const token = jwt.sign({ id: 1, username: DEFAULT_USERNAME }, JWT_SECRET, { expiresIn: '24h' })

      return sendJson(res, 200, {
        success: true,
        token,
        admin: {
          id: 1,
          username: DEFAULT_USERNAME,
        },
      })
    }

    // 4. Session Verification: GET /api/admin/me
    if (checkUrl.includes('/admin/me') || checkUrl.includes('/me')) {
      const user = verifyToken(req)
      if (!user) {
        return sendJson(res, 401, { error: 'Session expired or invalid. Please log in again.' })
      }
      return sendJson(res, 200, { admin: { id: user.id, username: user.username } })
    }

    // 5. Change Password: POST /api/admin/change-password
    if (checkUrl.includes('/change-password')) {
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

      const user = verifyToken(req)
      if (!user) {
        return sendJson(res, 401, { error: 'Unauthorized' })
      }

      const body = await parseBody(req)
      const { currentPassword, newPassword } = body || {}

      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return sendJson(res, 400, { error: 'New password must be at least 6 characters' })
      }

      const currentHash = state.adminPasswordHash || DEFAULT_PASSWORD_HASH
      if (!bcrypt.compareSync(currentPassword, currentHash)) {
        return sendJson(res, 400, { error: 'Current password incorrect' })
      }

      state.adminPasswordHash = bcrypt.hashSync(newPassword, 10)
      saveStateToDisk()

      return sendJson(res, 200, { success: true, message: 'Password updated successfully' })
    }

    // 6. Clear Analytics: POST /api/admin/clear-analytics
    if (checkUrl.includes('/clear-analytics')) {
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

      const user = verifyToken(req)
      if (!user) {
        return sendJson(res, 401, { error: 'Unauthorized' })
      }

      state.visitors = []
      state.events = []
      saveStateToDisk()

      return sendJson(res, 200, { success: true, message: 'All analytics records have been cleared.' })
    }

    // 7. Visitor Analytics: GET /api/admin/analytics
    if (checkUrl.includes('/analytics')) {
      const user = verifyToken(req)
      if (!user) {
        return sendJson(res, 401, { error: 'Unauthorized' })
      }

      const parsedUrl = new URL(rawUrl, 'http://localhost')
      const startDate = parsedUrl.searchParams.get('startDate')
      const endDate = parsedUrl.searchParams.get('endDate')

      let filteredEvents = state.events
      let filteredVisitors = state.visitors

      if (startDate && endDate) {
        const start = `${startDate}T00:00:00.000Z`
        const end = `${endDate}T23:59:59.999Z`
        filteredEvents = filteredEvents.filter((e) => e.created_at >= start && e.created_at <= end)
        filteredVisitors = filteredVisitors.filter((v) => v.last_visit >= start && v.last_visit <= end)
      } else if (startDate) {
        const start = `${startDate}T00:00:00.000Z`
        filteredEvents = filteredEvents.filter((e) => e.created_at >= start)
        filteredVisitors = filteredVisitors.filter((v) => v.last_visit >= start)
      }

      const totalPageViews = filteredEvents.length
      const totalVisitors = new Set(filteredEvents.map((e) => e.visitor_id)).size

      // Funnel metrics
      const funnel = [
        {
          step: 1,
          label: 'Visited Invitation',
          count: new Set(filteredEvents.filter((e) => e.step_number >= 1).map((e) => e.visitor_id)).size,
        },
        {
          step: 2,
          label: 'Said YES! 🥹💖',
          count: new Set(filteredEvents.filter((e) => e.event_type === 'accept_invitation').map((e) => e.visitor_id)).size,
        },
        {
          step: 3,
          label: 'Picked Date 📅',
          count: new Set(filteredEvents.filter((e) => e.event_type === 'select_date').map((e) => e.visitor_id)).size,
        },
        {
          step: 4,
          label: 'Picked Time ⏰',
          count: new Set(filteredEvents.filter((e) => e.event_type === 'select_time').map((e) => e.visitor_id)).size,
        },
        {
          step: 5,
          label: 'Chose Food 🍽️',
          count: new Set(filteredEvents.filter((e) => e.event_type === 'select_food').map((e) => e.visitor_id)).size,
        },
        {
          step: 6,
          label: 'Agreed to Terms 💌',
          count: new Set(filteredEvents.filter((e) => e.event_type === 'agree_terms').map((e) => e.visitor_id)).size,
        },
        {
          step: 7,
          label: 'Sealed Our Date! 🎉',
          count: new Set(filteredEvents.filter((e) => e.event_type === 'seal_date').map((e) => e.visitor_id)).size,
        },
      ]

      const acceptedCount = funnel[1].count
      const sealedCount = funnel[6].count
      const acceptanceRate = totalVisitors > 0 ? Math.round((acceptedCount / totalVisitors) * 100) : 0
      const completionRate = totalVisitors > 0 ? Math.round((sealedCount / totalVisitors) * 100) : 0

      // Device breakdown
      const deviceMap: Record<string, number> = {}
      for (const v of filteredVisitors) {
        deviceMap[v.device_type] = (deviceMap[v.device_type] || 0) + 1
      }
      const deviceBreakdown = Object.entries(deviceMap).map(([device_type, count]) => ({ device_type, count }))

      // Browser breakdown
      const browserMap: Record<string, number> = {}
      for (const v of filteredVisitors) {
        browserMap[v.browser] = (browserMap[v.browser] || 0) + 1
      }
      const browserBreakdown = Object.entries(browserMap).map(([browser, count]) => ({ browser, count }))

      // Daily trend
      const dateMap: Record<string, { views: number; visitors: Set<string> }> = {}
      for (const e of filteredEvents) {
        const d = e.created_at.slice(0, 10)
        if (!dateMap[d]) dateMap[d] = { views: 0, visitors: new Set() }
        dateMap[d].views++
        dateMap[d].visitors.add(e.visitor_id)
      }
      const dailyTrend = Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, val]) => ({ date, views: val.views, visitors: val.visitors.size }))

      // Recent visitors (top 50)
      const recentVisitors = [...filteredVisitors]
        .sort((a, b) => b.last_visit.localeCompare(a.last_visit))
        .slice(0, 50)

      // Recent events (top 50) with device info
      const visitorLookup = new Map(filteredVisitors.map((v) => [v.id, v]))
      const recentEvents = [...filteredEvents]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 50)
        .map((e) => {
          const v = visitorLookup.get(e.visitor_id)
          return {
            id: e.id,
            visitor_id: e.visitor_id,
            visitor_name: v?.name || null,
            event_type: e.event_type,
            step_number: e.step_number,
            details: e.details,
            created_at: e.created_at,
            device_type: v?.device_type || 'Unknown',
            browser: v?.browser || 'Unknown',
          }
        })

      return sendJson(res, 200, {
        kpis: {
          totalPageViews,
          totalVisitors,
          acceptedCount,
          sealedCount,
          acceptanceRate,
          completionRate,
        },
        funnel,
        deviceBreakdown,
        browserBreakdown,
        dailyTrend,
        recentVisitors,
        recentEvents,
      })
    }

    // 8. Public Visitor Tracking: POST /api/track
    if (checkUrl.includes('/track')) {
      if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

      const body = await parseBody(req)
      const {
        visitorId,
        visitorName,
        name,
        eventType = 'page_view',
        stepNumber = 1,
        details,
        device = {},
      } = body || {}

      if (!visitorId || typeof visitorId !== 'string') {
        return sendJson(res, 400, { error: 'visitorId is required' })
      }

      const submittedName = (visitorName || name || details?.name || null)?.toString().trim() || null

      const now = new Date().toISOString()
      const deviceType = device.type || 'Desktop'
      const browser = device.browser || 'Unknown'
      const os = device.os || 'Unknown'
      const referrer = device.referrer || 'Direct'

      let visitor = state.visitors.find((v) => v.id === visitorId)
      const isAccepted = (visitor?.accepted_date === 1) || (stepNumber >= 2) ? 1 : 0
      const isSealed = (visitor?.date_sealed === 1) || (stepNumber === 7) ? 1 : 0
      const highestStep = Math.max(visitor?.current_step || 1, Number(stepNumber) || 1)

      const chosenDate = details?.date || null
      const chosenTime = details?.time || null
      const chosenFood = details?.food || null

      if (!visitor) {
        visitor = {
          id: visitorId,
          name: submittedName,
          first_visit: now,
          last_visit: now,
          device_type: deviceType,
          browser,
          os,
          referrer,
          current_step: highestStep,
          accepted_date: isAccepted,
          chosen_date: chosenDate,
          chosen_time: chosenTime,
          chosen_food: chosenFood,
          date_sealed: isSealed,
        }
        state.visitors.push(visitor)
      } else {
        visitor.last_visit = now
        visitor.current_step = highestStep
        visitor.accepted_date = isAccepted
        if (submittedName) visitor.name = submittedName
        if (chosenDate) visitor.chosen_date = chosenDate
        if (chosenTime) visitor.chosen_time = chosenTime
        if (chosenFood) visitor.chosen_food = chosenFood
        visitor.date_sealed = isSealed
      }

      // Add to event timeline
      const newEventId = state.events.length ? Math.max(...state.events.map((e) => e.id)) + 1 : 1
      state.events.push({
        id: newEventId,
        visitor_id: visitorId,
        event_type: eventType,
        step_number: Number(stepNumber) || 1,
        details: details ? JSON.stringify(details) : null,
        created_at: now,
      })

      saveStateToDisk()
      return sendJson(res, 200, { success: true })
    }

    // 9. Catch-all for unknown /api/* routes
    return sendJson(res, 404, { error: `Endpoint not found: ${method} ${rawUrl}` })
  } catch (err: any) {
    console.error('[API Error]', err)
    return sendJson(res, 500, { error: err?.message || 'Internal server error' })
  }
}
