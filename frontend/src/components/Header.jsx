import { NavLink, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const { count } = useCart()
  const { user, isAdmin, logout, isFirebaseConfigured } = useAuth()

  return (
    <header className="header">
      <div className="container">
        <div className="header-wrapper">
          <div className="logo">
            <Link to="/">
              <h1>
                Tech<span>Store</span>
              </h1>
            </Link>
          </div>
          <nav className="nav">
            <ul className="nav-menu">
              <li>
                <NavLink to="/" end>
                  Головна
                </NavLink>
              </li>
              <li>
                <NavLink to="/catalog">Каталог</NavLink>
              </li>
              <li>
                <NavLink to="/cart">Кошик</NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink to="/admin">Адмін</NavLink>
                </li>
              )}
            </ul>
          </nav>
          <div className="header-actions">
            {isFirebaseConfigured && (
              <div className="auth-actions">
                {user ? (
                  <>
                    <span className="auth-email" title={user.email}>
                      {user.email}
                    </span>
                    <button type="button" className="btn-link" onClick={logout}>
                      Вийти
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn-link">
                    Увійти
                  </Link>
                )}
              </div>
            )}
            <div className="cart-icon">
              <Link to="/cart" aria-label="Перейти до кошика">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="cart-count">{count}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
