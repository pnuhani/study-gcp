"use client"

import { useContext } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  Login as LoginIcon,
} from "@mui/icons-material"
import api from "../api/api"
import { ThemeContext } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode } = useContext(ThemeContext)
  const { authState } = useAuth()

  const isSuperAdminPage = location.pathname.includes("/superadmin-dashboard")
  const isAdminPage = location.pathname.includes("/admin-dashboard")
  const isHomePage = location.pathname === "/"

  const handleLogout = async () => {
    try {
      await api.logout()
      navigate("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getDashboardLink = () => {
    if (authState.role === "SUPERADMIN") {
      return "/superadmin-dashboard"
    }
    return "/admin-dashboard"
  }

  return (
    <header
      className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} shadow-md transition-colors duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Title */}
          <div className="flex items-center">
            <Link to="/" className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
              {authState.isAuthenticated ? (
                isSuperAdminPage ? "Superadmin Dashboard" : "Admin Dashboard"
              ) : (
                "QwerVego"
              )}
            </Link>
          </div>

          {/* Right side - Navigation & Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            {authState.isAuthenticated && (
              <div className="md:hidden">
                <button
                  className={`p-2 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  aria-label="Menu"
                >
                  <MenuIcon />
                </button>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-4">
              {authState.isAuthenticated ? (
                <>
                  {/* Show Go to Dashboard button when on home page */}
                  {isHomePage && (
                    <Link
                      to={getDashboardLink()}
                      className={`flex items-center ${darkMode ? "text-gray-200 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                    >
                      <DashboardIcon className="mr-1 h-5 w-5" />
                      <span>Go to Dashboard</span>
                    </Link>
                  )}
                  {isSuperAdminPage && (
                    <>
                      <Link
                        to="/superadmin-dashboard"
                        className={`flex items-center ${darkMode ? "text-gray-200 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                      >
                        <DashboardIcon className="mr-1 h-5 w-5" />
                        <span>Superadmin Dashboard</span>
                      </Link>
                      <Link
                        to="/superadmin-dashboard/admins"
                        className={`flex items-center ${darkMode ? "text-gray-200 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                      >
                        <PeopleIcon className="mr-1 h-5 w-5" />
                        <span>Manage Admins</span>
                      </Link>
                    </>
                  )}
                  {isAdminPage && (
                    <Link
                      to="/admin-dashboard"
                      className={`flex items-center ${darkMode ? "text-gray-200 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                    >
                      <DashboardIcon className="mr-1 h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </>
              ) : (
                location.pathname !== "/admin/login" && (
                  <Link
                    to="/admin/login"
                    className={`flex items-center ${darkMode ? "text-gray-200 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                  >
                    <LoginIcon className="mr-1 h-5 w-5" />
                    <span>Admin Login</span>
                  </Link>
                )
              )}
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} transition-colors`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </button>

            {/* Logout Button - Only show when authenticated */}
            {authState.isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`flex items-center px-4 py-2 ${darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} text-white rounded-lg transition-colors`}
              >
                <LogoutIcon className="mr-1 h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

