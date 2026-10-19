import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'romantic-date-admin-secret-key-2026-unbreakable-token'

export interface AdminPayload {
  id: number
  username: string
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload
    }
  }
}

/**
 * Generate signed JWT token for admin session
 */
export function generateToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload
  } catch {
    return null
  }
}

/**
 * Server-side authentication middleware protecting private admin endpoints
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' })
    return
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' })
    return
  }

  // Ensure admin still exists in DB
  const admin = db.prepare('SELECT id, username FROM admins WHERE id = ?').get(decoded.id) as { id: number; username: string } | undefined
  if (!admin) {
    res.status(401).json({ error: 'Admin account not found.' })
    return
  }

  req.admin = { id: admin.id, username: admin.username }
  next()
}
