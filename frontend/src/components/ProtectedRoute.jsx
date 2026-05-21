import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading, isFirebaseConfigured } = useAuth()
  const location = useLocation()

  if (loading) return <p className="container">Завантаження…</p>

  if (!isFirebaseConfigured) {
    return (
      <div className="container">
        <h2>Адмінка недоступна</h2>
        <p>
          Firebase ще не налаштовано. Додайте VITE_FIREBASE_* змінні в <code>.env</code> і
          перезапустіть dev-сервер.
        </p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (requireAdmin && !isAdmin) {
    return (
      <div className="container">
        <h2>Доступ заборонено</h2>
        <p>Ця сторінка доступна тільки адміністраторам.</p>
      </div>
    )
  }
  return children
}
