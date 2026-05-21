/**
 * Seed Firestore with products from `seed/products.json` and upload images
 * (under `frontend/public/pic`) to Firebase Storage.
 *
 * Usage:
 *   # 1) Live Firebase:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
 *   node seed.js
 *
 *   # 2) Firebase Emulator:
 *   USE_FIREBASE_EMULATOR=true FIREBASE_PROJECT_ID=demo-techstore node seed.js
 */
import admin from 'firebase-admin'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedPath = path.join(__dirname, 'seed', 'products.json')
const picDir = path.resolve(__dirname, '..', 'frontend', 'public', 'pic')

const useEmulator = process.env.USE_FIREBASE_EMULATOR === 'true'
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'demo-techstore'

if (useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080'
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'
  process.env.FIREBASE_STORAGE_EMULATOR_HOST =
    process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199'
}

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
let credential
if (credPath && fs.existsSync(credPath)) {
  credential = admin.credential.cert(JSON.parse(fs.readFileSync(credPath, 'utf8')))
} else {
  credential = admin.credential.applicationDefault()
}

admin.initializeApp({
  credential,
  projectId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
})

const db = admin.firestore()
const bucket = admin.storage().bucket()

async function seedProducts() {
  const { products } = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
  console.log(`Завантажую ${products.length} товарів у Firestore...`)
  const batch = db.batch()
  for (const p of products) {
    const ref = db.collection('products').doc(String(p.id))
    batch.set(ref, p)
  }
  await batch.commit()
  console.log('✓ Товари в Firestore')
}

async function uploadImages() {
  if (!fs.existsSync(picDir)) {
    console.log('Папку pic не знайдено, картинки пропускаю.')
    return
  }
  const files = fs.readdirSync(picDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  console.log(`Завантажую ${files.length} картинок у Storage...`)
  for (const file of files) {
    const local = path.join(picDir, file)
    const remote = `products/${file}`
    await bucket.upload(local, {
      destination: remote,
      metadata: { cacheControl: 'public, max-age=86400' },
    })
    await bucket.file(remote).makePublic()
    process.stdout.write('.')
  }
  console.log('\n✓ Картинки в Storage')
}

async function run() {
  console.log(`Проєкт: ${projectId} ${useEmulator ? '(емулятор)' : ''}`)
  await seedProducts()
  try {
    await uploadImages()
  } catch (e) {
    console.warn('Не вдалося завантажити картинки:', e.message)
  }
  console.log('Готово.')
  process.exit(0)
}

run().catch((err) => {
  console.error('Помилка:', err)
  process.exit(1)
})
