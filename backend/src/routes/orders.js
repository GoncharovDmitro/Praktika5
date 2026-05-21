import { Router } from 'express'
import { getFirestore, isFirebaseReady } from '../firebase.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()

// In-memory store fallback
let memoryOrders = []

router.post('/', optionalAuth, async (req, res) => {
  try {
    const order = req.body
    if (!order?.items?.length || !order?.customer?.name) {
      return res.status(400).json({ error: 'items та customer.name обовʼязкові' })
    }
    const record = {
      ...order,
      userId: req.user?.uid || order.userId || null,
      createdAt: new Date().toISOString(),
      status: 'new',
    }
    if (isFirebaseReady()) {
      const ref = await getFirestore().collection('orders').add(record)
      return res.status(201).json({ id: ref.id, ...record })
    }
    const id = `local-${Date.now()}`
    memoryOrders.push({ id, ...record })
    res.status(201).json({ id, ...record })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/my', requireAuth, async (req, res) => {
  try {
    if (isFirebaseReady()) {
      const snap = await getFirestore()
        .collection('orders')
        .where('userId', '==', req.user.uid)
        .get()
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      return res.json({ orders })
    }
    res.json({ orders: memoryOrders.filter((o) => o.userId === req.user.uid) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
