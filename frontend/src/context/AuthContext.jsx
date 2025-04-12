import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    role: null,
    initialized: false,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdTokenResult()
        setAuthState({
          isAuthenticated: true,
          role: idToken.claims.role,
          initialized: true,
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          role: null,
          initialized: true,
        })
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
