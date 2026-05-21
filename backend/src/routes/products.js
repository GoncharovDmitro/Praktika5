import { Router } from 'express'
import { getFirestore, isFirebaseReady, seedProducts } from '../firebase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// In-memory store used when Firestore is not configured.
let memory = [...seedProducts]

function productsCollection() {
  return getFirestore().collection('products')
}

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    let items
    if (isFirebaseReady()) {
      let query = productsCollection()
      if (category) query = query.where('category', '==', String(category))
      const snap = await query.get()
      items = snap.docs.map((d) => ({ id: d.data().id ?? Number(d.id), ...d.data() }))
    } else {
      items = memory
      if (category) items = items.filter((p) => p.category === category)
    }
    if (search) {
      const q = String(search).toLowerCase()
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q),
      )
    }
    res.json({ products: items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isFirebaseReady()) {
      const snap = await productsCollection().doc(String(id)).get()
      if (!snap.exists) return res.status(404).json({ error: 'Not found' })
      res.json({ id, ...snap.data() })
    } else {
      const p = memory.find((x) => x.id === id)
      if (!p) return res.status(404).json({ error: 'Not found' })
      res.json(p)
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = req.body
    if (!data?.name || !data?.category || data.price == null) {
      return res.status(400).json({ error: 'name, category, price є обовʼязковими' })
    }
    if (isFirebaseReady()) {
      const id = Number(data.id) || Date.now()
      await productsCollection()
        .doc(String(id))
        .set({ ...data, id })
      res.status(201).json({ ...data, id })
    } else {
      const id = Number(data.id) || (memory.reduce((m, p) => Math.max(m, p.id), 0) + 1)
      const product = { ...data, id }
      memory.push(product)
      res.status(201).json(product)
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const data = { ...req.body, id }
    if (isFirebaseReady()) {
      await productsCollection().doc(String(id)).set(data, { merge: true })
      res.json(data)
    } else {
      const idx = memory.findIndex((p) => p.id === id)
      if (idx < 0) return res.status(404).json({ error: 'Not found' })
      memory[idx] = { ...memory[idx], ...data }
      res.json(memory[idx])
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isFirebaseReady()) {
      await productsCollection().doc(String(id)).delete()
    } else {
      memory = memory.filter((p) => p.id !== id)
    }
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
