import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import PropTypes from 'prop-types'

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
        const role = idToken.claims.role
        
        // Only consider users with admin roles as authenticated in admin context
        if (role === "ADMIN" || role === "SUPERADMIN") {
          setAuthState({
            isAuthenticated: true,
            role: role,
            initialized: true,
          })
        } else {
          // User has no admin role - not authenticated for admin purposes
          setAuthState({
            isAuthenticated: false,
            role: null,
            initialized: true,
          })
        }
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

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export const useAuth = () => useContext(AuthContext);
