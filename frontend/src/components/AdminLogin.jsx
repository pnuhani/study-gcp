"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase"
import LockIcon from "@mui/icons-material/Lock"
import EmailIcon from "@mui/icons-material/Email"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import { useAuth } from "../context/AuthContext"
import { ThemeContext } from "../context/ThemeContext"

const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
})

export default function AdminLogin() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState("")
  const { setAuthState } = useAuth()
  const { darkMode, toggleDarkMode } = useContext(ThemeContext)

  // Add this effect to prevent accessing login page when already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdTokenResult()
        const role = idToken.claims.role
        
        // Only redirect if user has admin role
        if (role === "SUPERADMIN" || role === "ADMIN") {
          setAuthState({
            isAuthenticated: true,
            role: role,
            initialized: true,
          })

          // Navigate based on role
          if (role === "SUPERADMIN") {
            navigate("/superadmin-dashboard", { replace: true })
          } else if (role === "ADMIN") {
            navigate("/admin-dashboard", { replace: true })
          }
        }
        // If user has no admin role, do nothing (let them stay on login page or continue their flow)
      }
    })

    return () => unsubscribe()
  }, [navigate, setAuthState])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setServerError("")
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        data.email.trim(), 
        data.password.trim()
      )
      
      // Get the ID token
      const idToken = await userCredential.user.getIdTokenResult()
      
      // Check custom claims for role
      const role = idToken.claims.role
      
      if (!role) {
        setServerError("Insufficient permissions")
        await auth.signOut()
        return
      }

      setAuthState({
        isAuthenticated: true,
        role: role,
        initialized: true,
      })

      // Force navigation after state update
      if (role === "SUPERADMIN") {
        navigate("/superadmin-dashboard", { replace: true })
      } else if (role === "ADMIN") {
        navigate("/admin-dashboard", { replace: true })
      }
    } catch (error) {
      console.error("Error:", error)
      setServerError("Invalid email or password")
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-100"} transition-colors duration-200`}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-white text-gray-800 hover:bg-gray-200"} transition-colors shadow-md`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </button>
      </div>

      <div
        className={`max-w-md w-full ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg overflow-hidden transition-colors duration-200`}
      >
        <div className={`${darkMode ? "bg-[#2d4860]" : "bg-[#3a5a78]"} px-6 py-8 text-center`}>
          <h1 className="text-white text-2xl font-bold">QR Code Admin</h1>
          <p className="text-blue-100 mt-2">Sign in to manage your QR codes</p>
        </div>

        <div className="p-6">
          {serverError && (
            <div
              className={`mb-4 p-4 ${darkMode ? "bg-red-900/30 border-red-800 text-red-400" : "bg-red-50 border-red-500 text-red-700"} border-l-4`}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EmailIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
              </div>
              <input
                type="email"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-600"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-[#3a5a78]"
                } ${errors.email ? "border-red-500" : ""}`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
              </div>
              <input
                type="password"
                {...register("password")}
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-600"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-[#3a5a78]"
                } ${errors.password ? "border-red-500" : ""}`}
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-900"
                  : "bg-[#3a5a78] hover:bg-[#2d4860] focus:ring-[#3a5a78]"
              } text-white py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200`}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

