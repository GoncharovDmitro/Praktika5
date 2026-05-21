import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct, listProducts } from '../api/client.js'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice, getCategoryName } from '../utils/format.js'
import ProductCard from '../components/ProductCard.jsx'

export default function Product() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getProduct(id), listProducts()])
      .then(([p, all]) => {
        setProduct(p)
        if (p) {
          setRecommendations(
            all
              .filter((x) => x.category === p.category && x.id !== p.id)
              .slice(0, 3),
          )
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="container">
        <p>Завантаження…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container">
        <h1>Товар не знайдено</h1>
        <Link to="/catalog" className="btn btn-primary">
          До каталогу
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="product-details">
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
          {!product.inStock && <span className="badge badge--out">Немає в наявності</span>}
        </div>
        <div className="product-details-info">
          <Link to={`/catalog?category=${encodeURIComponent(product.category)}`} className="product-category">
            {getCategoryName(product.category)}
          </Link>
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          {product.specs && (
            <div className="product-specs">
              <h3>Характеристики</h3>
              <p>{product.specs}</p>
            </div>
          )}
          <div className="product-price-large">{formatPrice(product.price)}</div>
          <div className="product-actions">
            <div className="qty-control">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
              <button type="button" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!product.inStock}
              onClick={() => addItem(product, qty)}
            >
              {product.inStock ? 'Додати в кошик' : 'Немає в наявності'}
            </button>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="section">
          <div className="section-title">
            <h2>Може зацікавити</h2>
          </div>
          <div className="products-grid">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
