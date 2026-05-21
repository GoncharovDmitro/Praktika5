import { getAuth, isFirebaseReady } from '../firebase.js'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@techstore.ua')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export async function requireAuth(req, res, next) {
  if (!isFirebaseReady()) {
    // Без Firebase Auth ми не можемо валідувати токени — у dev-режимі дозволяємо.
    req.user = { uid: 'dev', email: 'dev@local', dev: true }
    return next()
  }
  const header = req.headers.authorization || ''
  const match = header.match(/^Bearer (.+)$/)
  if (!match) return res.status(401).json({ error: 'No token' })
  try {
    const decoded = await getAuth().verifyIdToken(match[1])
    req.user = decoded
    next()
  } catch (e) {
    res.status(401).json({ error: 'Invalid token', message: e.message })
  }
}

export function requireAdmin(req, res, next) {
  const email = (req.user?.email || '').toLowerCase()
  if (req.user?.dev || (email && ADMIN_EMAILS.includes(email)) || req.user?.admin === true) {
    return next()
  }
  res.status(403).json({ error: 'Admin only' })
}

export function optionalAuth(req, _res, next) {
  if (!isFirebaseReady()) return next()
  const header = req.headers.authorization || ''
  const match = header.match(/^Bearer (.+)$/)
  if (!match) return next()
  getAuth()
    .verifyIdToken(match[1])
    .then((decoded) => {
      req.user = decoded
      next()
    })
    .catch(() => next())
}
