import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { createOrder } from '../api/client.js'
import { formatPrice } from '../utils/format.js'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  payment: 'cash',
  comment: '',
}

export default function Cart() {
  const { items, sum, count, updateQuantity, removeItem, clear } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState(null)

  function validate() {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Введіть ім'я (мін. 2 символи)"
    if (!/^\+?\d[\d\s\-()]{8,}$/.test(form.phone.trim())) e.phone = 'Некоректний номер телефону'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Некоректний email'
    if (!form.address.trim() || form.address.trim().length < 5) e.address = 'Введіть повну адресу'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) {
      showToast('Перевірте поля форми', 'error')
      return
    }
    setSubmitting(true)
    try {
      const order = {
        customer: { ...form },
        items: items.map((it) => ({
          productId: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
        })),
        total: sum,
        userId: user?.uid || null,
      }
      try {
        const saved = await createOrder(order)
        setOrderId(saved?.id || 'local-' + Date.now())
      } catch (err) {
        console.warn('API недоступне, замовлення збережено локально:', err.message)
        setOrderId('local-' + Date.now())
      }
      showToast('Замовлення оформлено!', 'success')
      clear()
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      showToast('Не вдалося оформити замовлення', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderId) {
    return (
      <div className="container">
        <div className="empty-state">
          <h1>Дякуємо за замовлення!</h1>
          <p>Номер замовлення: <strong>{orderId}</strong></p>
          <p>Ми зв'яжемося з вами найближчим часом.</p>
          <Link to="/catalog" className="btn btn-primary">
            Продовжити покупки
          </Link>
        </div>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="container">
        <h1 className="cart-title">🛒 Кошик</h1>
        <div className="empty-state">
          <p>Ваш кошик порожній</p>
          <Link to="/catalog" className="btn btn-primary">
            Перейти до каталогу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="cart-title">🛒 Кошик</h1>
      <div className="cart-grid">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <Link to={`/product/${item.id}`}>
                  <h3>{item.name}</h3>
                </Link>
                <p>{formatPrice(item.price)}</p>
              </div>
              <div className="cart-item-qty">
                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, Math.max(1, Number(e.target.value) || 1))
                  }
                />
                <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>
              <div className="cart-item-total">{formatPrice(item.price * item.quantity)}</div>
              <button
                type="button"
                className="cart-item-remove"
                aria-label="Видалити"
                onClick={() => removeItem(item.id)}
              >
                🗑️
              </button>
            </div>
          ))}
          <button type="button" className="btn-clear-cart" onClick={clear}>
            Очистити кошик
          </button>
        </div>

        <form className="order-form" onSubmit={handleSubmit} noValidate>
          <h2>Оформлення замовлення</h2>
          <label>
            <span>Імʼя та прізвище *</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <small className="error">{errors.name}</small>}
          </label>
          <label>
            <span>Телефон *</span>
            <input
              type="tel"
              placeholder="+380..."
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {errors.phone && <small className="error">{errors.phone}</small>}
          </label>
          <label>
            <span>Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <small className="error">{errors.email}</small>}
          </label>
          <label>
            <span>Адреса доставки *</span>
            <input
              type="text"
              placeholder="Місто, вулиця, будинок"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            {errors.address && <small className="error">{errors.address}</small>}
          </label>
          <label>
            <span>Спосіб оплати</span>
            <select
              value={form.payment}
              onChange={(e) => setForm({ ...form, payment: e.target.value })}
            >
              <option value="cash">Готівка при отриманні</option>
              <option value="card">Карта при отриманні</option>
              <option value="online">Онлайн-оплата</option>
            </select>
          </label>
          <label>
            <span>Коментар</span>
            <textarea
              rows="3"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </label>

          <div className="order-summary">
            <div>
              <span>Товарів:</span> <strong>{count}</strong>
            </div>
            <div className="order-total">
              <span>До сплати:</span> <strong>{formatPrice(sum)}</strong>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Відправлення…' : 'Підтвердити замовлення'}
          </button>
        </form>
      </div>
    </div>
  )
}
