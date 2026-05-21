import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listProducts } from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'

export default function Home() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    listProducts().then(setProducts).catch(console.error)
  }, [])

  const featured = useMemo(() => products.slice(0, 4), [products])

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [search, products])

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="eyebrow">
              Доставка по Україні за 1–3 дні · Гарантія 12 місяців
            </span>
            <h2>
              Збери Свій ідеальний ПК з <em>TechStore</em>
            </h2>
            <p>
              Процесори, відеокарти, памʼять і накопичувачі від провідних брендів за чесною
              ціною.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn btn-primary">
                Перейти до каталогу
              </Link>
              <a href="#categories" className="btn btn-secondary">
                Популярні категорії
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="container">
          <div className="search-wrapper">
            <h2>Знайдіть потрібне за кілька секунд</h2>
            <p>Почніть вводити назву товару або категорію — результати оновлюються одразу</p>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Наприклад, RTX 4080 або DDR5..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="Очистити"
                  onClick={() => setSearch('')}
                >
                  ✖
                </button>
              )}
              {searchFocus && search && (
                <div className="search-results">
                  {searchResults.length === 0 ? (
                    <div className="search-empty">Нічого не знайдено</div>
                  ) : (
                    searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="search-result-item"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          navigate(`/product/${p.id}`)
                        }}
                      >
                        <img src={p.image} alt={p.name} />
                        <div>
                          <div className="search-result-name">{p.name}</div>
                          <div className="search-result-category">{p.category}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="categories section" id="categories">
        <div className="container">
          <div className="section-title">
            <h2>Популярні категорії</h2>
            <p>Оберіть необхідну категорію для вашого компʼютера</p>
          </div>
          <div className="categories-grid">
            {[
              { c: 'CPU', icon: '⚡', title: 'Процесори', sub: 'Intel та AMD' },
              { c: 'GPU', icon: '🎮', title: 'Відеокарти', sub: 'NVIDIA та Radeon' },
              { c: 'RAM', icon: '💾', title: 'Оперативна пам\u02bcять', sub: 'DDR4 та DDR5' },
              { c: 'накопичувачі', icon: '💿', title: 'Накопичувачі', sub: 'SSD та HDD' },
            ].map((cat) => (
              <button
                key={cat.c}
                type="button"
                className="category-card"
                onClick={() => navigate(`/catalog?category=${encodeURIComponent(cat.c)}`)}
              >
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.title}</h3>
                <p>{cat.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-products section">
        <div className="container">
          <div className="section-title">
            <h2>Рекомендовані товари</h2>
            <p>Найпопулярніші товари цього місяця</p>
          </div>
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <h3>Швидка доставка</h3>
              <p>По всій Україні за 1-3 дні</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <h3>Гарантія якості</h3>
              <p>12 місяців офіційної гарантії</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💳</div>
              <h3>Зручна оплата</h3>
              <p>Готівка, картка, безготівковий розрахунок</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔄</div>
              <h3>Повернення товару</h3>
              <p>Протягом 14 днів</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
