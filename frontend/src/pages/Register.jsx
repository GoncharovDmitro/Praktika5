import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Register() {
  const { register, loginWithGoogle, isFirebaseConfigured } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isFirebaseConfigured) {
      showToast('Firebase Auth не налаштовано', 'error')
      return
    }
    setSubmitting(true)
    try {
      await register(email, password)
      showToast('Акаунт створено', 'success')
      navigate('/')
    } catch (err) {
      showToast(err.message || 'Не вдалося створити акаунт', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    if (!isFirebaseConfigured) {
      showToast('Firebase Auth не налаштовано', 'error')
      return
    }
    setSubmitting(true)
    try {
      await loginWithGoogle()
      showToast('Акаунт через Google створено', 'success')
      navigate('/')
    } catch (err) {
      showToast(err.message || 'Не вдалося увійти через Google', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container auth-container">
      <h1>Реєстрація</h1>
      <button
        type="button"
        className="btn btn-google"
        onClick={handleGoogle}
        disabled={submitting || !isFirebaseConfigured}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1A6.92 6.92 0 0 1 5.47 12c0-.73.13-1.43.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
          />
        </svg>
        Зареєструватися через Google
      </button>
      <div className="auth-divider">
        <span>або</span>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          <span>Пароль (мін. 6 символів)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Створення…' : 'Створити акаунт'}
        </button>
      </form>
      <p>
        Вже є акаунт? <Link to="/login">Увійти</Link>
      </p>
    </div>
  )
}
