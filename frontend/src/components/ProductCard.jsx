import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice, getCategoryName } from '../utils/format.js'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <img src={product.image} alt={product.name} loading="lazy" />
          {!product.inStock && <span className="badge badge--out">Немає</span>}
        </div>
        <div className="product-info">
          <span className="product-category">{getCategoryName(product.category)}</span>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-price">{formatPrice(product.price)}</div>
        </div>
      </Link>
      <button
        type="button"
        className="btn btn-primary btn-add-to-cart"
        onClick={() => addItem(product)}
        disabled={!product.inStock}
      >
        {product.inStock ? 'У кошик' : 'Немає в наявності'}
      </button>
    </article>
  )
}
