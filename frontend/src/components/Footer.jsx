import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>TechStore</h3>
            <p>Ваш надійний партнер у світі комп'ютерних комплектуючих з 2024 року</p>
          </div>
          <div className="footer-section">
            <h4>Навігація</h4>
            <ul>
              <li>
                <Link to="/">Головна</Link>
              </li>
              <li>
                <Link to="/catalog">Каталог</Link>
              </li>
              <li>
                <Link to="/cart">Кошик</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Контакти</h4>
            <p>📞 +380 (44) 123-45-67</p>
            <p>✉ info@techstore.ua</p>
          </div>
          <div className="footer-section">
            <h4>Соціальні мережі</h4>
            <div className="social-links">
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
              <a href="#">Telegram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TechStore. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  )
}
