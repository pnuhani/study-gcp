"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import api from "../api/api"
import Header from "./Header"
import { ThemeContext } from "../context/ThemeContext"
import Loader from "./Loader"

export default function AdminList() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null) // Add this state
  const [error, setError] = useState(null)
  const { darkMode } = useContext(ThemeContext)

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      const data = await api.getAllAdmins()
      setAdmins(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        setDeletingId(id) // Set deleting state
        await api.deleteAdmin(id)
        setAdmins(admins.filter((admin) => admin.id !== id))
      } catch (err) {
        setError(err.message)
      } finally {
        setDeletingId(null) // Clear deleting state
      }
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <p className="ml-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
          <Link
            to="/superadmin-dashboard/admins/create"
            className={`${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-[#3a5a78] hover:bg-[#2d4860]"} text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors`}
          >
            Create New Admin
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {admin.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {admin.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {deletingId === admin.id ? (
                        <Loader size="small" />
                      ) : (
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

