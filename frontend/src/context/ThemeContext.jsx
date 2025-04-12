import { createContext, useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import PropTypes from "prop-types"


export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"
  })

  // List of paths that should always be in light mode
  const lightModeRoutes = [
    "/qr",
    "/forgot-password"
  ]

  const shouldForceLightMode = () => {
    return lightModeRoutes.some(route => location.pathname.startsWith(route))
  }

  useEffect(() => {
    // Force light mode for specific routes
    if (shouldForceLightMode()) {
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("dark")
      return
    }

    // Apply dark mode to document for other routes
    if (darkMode) {
      document.documentElement.classList.add("dark")
      document.body.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("dark")
    }

    // Save to localStorage only if not in forced light mode routes
    if (!shouldForceLightMode()) {
      localStorage.setItem("darkMode", darkMode)
    }
  }, [darkMode, location.pathname])

  const toggleDarkMode = () => {
    if (!shouldForceLightMode()) {
      setDarkMode((prev) => !prev)
    }
  }

  // Provide the actual dark mode value based on route
  const contextValue = {
    darkMode: shouldForceLightMode() ? false : darkMode,
    toggleDarkMode
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
}

