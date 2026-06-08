import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listProducts } from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'

const CATEGORIES = [
  { v: 'CPU', label: 'Процесори' },
  { v: 'GPU', label: 'Відеокарти' },
  { v: 'RAM', label: 'Оперативна пам\u02bcять' },
  { v: 'накопичувачі', label: 'Накопичувачі' },
]

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [params, setParams] = useSearchParams()

  const [selectedCats, setSelectedCats] = useState(
    () => new Set(params.get('category') ? [params.get('category')] : []),
  )
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [search, setSearch] = useState('')

  useEffect(() => {
    listProducts().then(setProducts).catch(console.error)
  }, [])

  const filtered = useMemo(() => {
    let res = products
    if (selectedCats.size > 0) res = res.filter((p) => selectedCats.has(p.category))
    if (minPrice !== '') res = res.filter((p) => p.price >= Number(minPrice))
    if (maxPrice !== '') res = res.filter((p) => p.price <= Number(maxPrice))
    if (inStockOnly) res = res.filter((p) => p.inStock)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      res = res.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q),
      )
    }
    switch (sortBy) {
      case 'price-asc':
        res = [...res].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        res = [...res].sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        res = [...res].sort((a, b) => a.name.localeCompare(b.name, 'uk'))
        break
      case 'name-desc':
        res = [...res].sort((a, b) => b.name.localeCompare(a.name, 'uk'))
        break
      default:
        break
    }
    return res
  }, [products, selectedCats, minPrice, maxPrice, inStockOnly, sortBy, search])

  function toggleCat(c) {
    setSelectedCats((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      // keep URL in sync (single category only for shareability)
      if (next.size === 1) setParams({ category: [...next][0] })
      else setParams({})
      return next
    })
  }

  function clearFilters() {
    setSelectedCats(new Set())
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
    setSortBy('default')
    setSearch('')
    setParams({})
  }

  return (
    <>
      <div className="catalog-header">
        <div className="container">
          <h1>Каталог товарів</h1>
          <p>Виберіть комплектуючі для вашого ідеального ПК</p>
          <div className="catalog-search">
            <input
              type="text"
              className="catalog-search-input"
              placeholder="🔍 Швидкий пошук за назвою..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="catalog-wrapper">
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>Категорії</h3>
              <div className="filter-group">
                {CATEGORIES.map((c) => (
                  <label key={c.v}>
                    <input
                      type="checkbox"
                      checked={selectedCats.has(c.v)}
                      onChange={() => toggleCat(c.v)}
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Ціна, грн</h3>
              <div className="price-filter">
                <input
                  type="number"
                  placeholder="Від"
                  step="500"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="До"
                  step="500"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-section">
              <h3>Наявність</h3>
              <label>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>Тільки в наявності</span>
              </label>
            </div>

            <button type="button" className="btn-clear" onClick={clearFilters}>
              Очистити фільтри
            </button>
          </aside>

          <div className="products-area">
            <div className="sorting-bar">
              <div className="results-count">Знайдено товарів: {filtered.length}</div>
              <select
                className="sort-select"
                aria-label="Сортувати"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">За замовчуванням</option>
                <option value="price-asc">Ціна: від дешевших до дорожчих</option>
                <option value="price-desc">Ціна: від дорожчих до дешевших</option>
                <option value="name-asc">Назва: А → Я</option>
                <option value="name-desc">Назва: Я → А</option>
              </select>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <p>За вашим запитом нічого не знайдено</p>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
