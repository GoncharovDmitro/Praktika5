import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth, isFirebaseConfigured } from '../api/firebase.js'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@techstore.ua')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase Auth не налаштовано')
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const register = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase Auth не налаштовано')
    await createUserWithEmailAndPassword(auth, email, password)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase Auth не налаштовано')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
  }, [])

  const logout = useCallback(async () => {
    if (!auth) return
    await signOut(auth)
  }, [])

  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        isAdmin,
        isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
