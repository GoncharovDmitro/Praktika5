import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useToast } from './ToastContext.jsx'

const CartContext = createContext(null)
const STORAGE_KEY = 'cart'

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const { showToast } = useToast()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback(
    (product, quantity = 1) => {
      if (!product || product.inStock === false) {
        showToast('Товар тимчасово відсутній', 'error')
        return
      }
      setItems((prev) => {
        const idx = prev.findIndex((it) => it.id === product.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
          return next
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity,
          },
        ]
      })
      showToast(`«${product.name}» додано до кошика`, 'success')
    },
    [showToast],
  )

  const removeItem = useCallback(
    (id) => {
      setItems((prev) => prev.filter((it) => it.id !== id))
      showToast('Товар видалено з кошика', 'info')
    },
    [showToast],
  )

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((it) => it.id !== id)
      return prev.map((it) => (it.id === id ? { ...it, quantity } : it))
    })
  }, [])

  const clear = useCallback(() => {
    setItems([])
    showToast('Кошик очищено', 'info')
  }, [showToast])

  const totals = useMemo(() => {
    const count = items.reduce((acc, it) => acc + it.quantity, 0)
    const sum = items.reduce((acc, it) => acc + it.price * it.quantity, 0)
    return { count, sum }
  }, [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, ...totals }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
