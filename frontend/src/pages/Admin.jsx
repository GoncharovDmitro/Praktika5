import { useEffect, useState } from 'react'
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatPrice } from '../utils/format.js'

const empty = {
  id: '',
  name: '',
  category: 'CPU',
  price: 0,
  description: '',
  specs: '',
  image: '',
  inStock: true,
}

export default function Admin() {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)

  async function refresh() {
    try {
      setProducts(await listProducts())
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  function startCreate() {
    setEditing('new')
    setForm({ ...empty, id: Math.max(0, ...products.map((p) => p.id)) + 1 })
  }

  function startEdit(p) {
    setEditing(p.id)
    setForm({ ...p })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        id: Number(form.id),
      }
      if (editing === 'new') {
        await createProduct(payload)
        showToast('Товар створено', 'success')
      } else {
        await updateProduct(editing, payload)
        showToast('Товар оновлено', 'success')
      }
      setEditing(null)
      refresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Видалити товар?')) return
    try {
      await deleteProduct(id)
      showToast('Товар видалено', 'success')
      refresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="container">
      <h1>Адмін-панель</h1>
      <p>Управління товарами TechStore.</p>
      <button type="button" className="btn btn-primary" onClick={startCreate}>
        + Додати товар
      </button>

      {editing !== null && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editing === 'new' ? 'Новий товар' : `Редагування #${editing}`}</h2>
          <div className="admin-grid">
            <label>
              <span>ID</span>
              <input
                type="number"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                required
                disabled={editing !== 'new'}
              />
            </label>
            <label>
              <span>Назва</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Категорія</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="CPU">CPU</option>
                <option value="GPU">GPU</option>
                <option value="RAM">RAM</option>
                <option value="накопичувачі">Накопичувачі</option>
              </select>
            </label>
            <label>
              <span>Ціна, грн</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Зображення (URL або pic/...)</span>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                required
              />
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
              />
              <span>В наявності</span>
            </label>
          </div>
          <label>
            <span>Опис</span>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label>
            <span>Характеристики</span>
            <input
              type="text"
              value={form.specs}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
            />
          </label>
          <div className="admin-actions">
            <button type="submit" className="btn btn-primary">
              Зберегти
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
              Скасувати
            </button>
          </div>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Зображення</th>
            <th>Назва</th>
            <th>Категорія</th>
            <th>Ціна</th>
            <th>Наявність</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                <img src={p.image} alt={p.name} className="admin-thumb" />
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{formatPrice(p.price)}</td>
              <td>{p.inStock ? '✅' : '⛔'}</td>
              <td>
                <button type="button" className="btn-link" onClick={() => startEdit(p)}>
                  ✏️
                </button>
                <button type="button" className="btn-link" onClick={() => handleDelete(p.id)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
