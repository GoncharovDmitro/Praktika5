import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import { isFirebaseReady } from './firebase.js'

const app = express()
const PORT = Number(process.env.PORT) || 4000
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, firebase: isFirebaseReady(), ts: Date.now() })
})

app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`[techstore-api] http://localhost:${PORT}  (firebase: ${isFirebaseReady()})`)
})
