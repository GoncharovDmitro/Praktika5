import admin from 'firebase-admin'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
const projectId = process.env.FIREBASE_PROJECT_ID
const useEmulator = process.env.USE_FIREBASE_EMULATOR === 'true'

let firestore = null
let auth = null
let initialised = false

function tryInit() {
  if (initialised) return
  initialised = true

  if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST =
      process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'
  }

  let credential = null
  if (credentialsPath && fs.existsSync(credentialsPath)) {
    const json = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
    credential = admin.credential.cert(json)
  } else if (useEmulator) {
    credential = admin.credential.applicationDefault()
  }

  if (!credential && !useEmulator) {
    console.warn(
      '[firebase] GOOGLE_APPLICATION_CREDENTIALS не задано і емулятор вимкнено — Firestore вимкнено, працюємо in-memory.',
    )
    return
  }

  try {
    admin.initializeApp({
      credential,
      projectId: projectId || credential?.projectId,
    })
    firestore = admin.firestore()
    auth = admin.auth()
    console.log('[firebase] ініціалізовано', useEmulator ? '(емулятор)' : '(прод)')
  } catch (err) {
    console.error('[firebase] не вдалося ініціалізувати:', err.message)
  }
}

tryInit()

export function getFirestore() {
  return firestore
}

export function getAuth() {
  return auth
}

export function isFirebaseReady() {
  return Boolean(firestore)
}

// Load seed products as in-memory fallback
const seedPath = path.resolve(__dirname, '../../firebase/seed/products.json')
let seed = { products: [] }
try {
  seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
} catch {
  // ignore — file may not exist yet
}
export const seedProducts = seed.products
