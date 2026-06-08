import { auth } from './firebase.js'
import localProducts from '../data_seed.json'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_DATA === 'true'

// Normalise relative image paths (e.g. "pic/1.png") so they work on any SPA route.
function normaliseProduct(p) {
  if (!p) return p
  let image = p.image || ''
  if (image && !image.startsWith('/') && !image.startsWith('http')) image = '/' + image
  return { ...p, image }
}
function normaliseList(list) {
  return Array.isArray(list) ? list.map(normaliseProduct) : list
}

async function authHeaders() {
  if (!auth?.currentUser) return {}
  const token = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...(options.headers || {}),
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.status === 204 ? null : res.json()
}

// ---------- Products ----------
export async function listProducts() {
  if (USE_LOCAL) return normaliseList(localProducts.products)
  try {
    const data = await request('/products')
    return normaliseList(data.products ?? data)
  } catch (e) {
    console.warn('API недоступне, fallback на локальний JSON:', e.message)
    return normaliseList(localProducts.products)
  }
}

export async function getProduct(id) {
  const numId = Number(id)
  if (USE_LOCAL) {
    return normaliseProduct(localProducts.products.find((p) => p.id === numId)) || null
  }
  try {
    return normaliseProduct(await request(`/products/${numId}`))
  } catch (e) {
    console.warn('API недоступне, fallback на локальний JSON:', e.message)
    return normaliseProduct(localProducts.products.find((p) => p.id === numId)) || null
  }
}

export async function createProduct(product) {
  return request('/products', { method: 'POST', body: JSON.stringify(product) })
}

export async function updateProduct(id, product) {
  return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) })
}

export async function deleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' })
}

// ---------- Orders ----------
export async function createOrder(order) {
  return request('/orders', { method: 'POST', body: JSON.stringify(order) })
}

export async function listMyOrders() {
  return request('/orders/my')
}
