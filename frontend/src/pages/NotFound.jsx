import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty-state">
        <h1>404</h1>
        <p>Сторінку не знайдено</p>
        <Link to="/" className="btn btn-primary">
          На головну
        </Link>
      </div>
    </div>
  )
}
