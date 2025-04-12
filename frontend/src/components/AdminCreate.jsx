import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"
import Header from "./Header"
import { ThemeContext } from "../context/ThemeContext"

export default function AdminCreate() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "ADMIN", 
    })
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const { darkMode } = useContext(ThemeContext)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.createAdmin(formData)
            navigate("/superadmin-dashboard/admins")
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Header />
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="w-full max-w-md mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Create New Admin</h1>

                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="shadow appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="shadow appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="shadow appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="shadow appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="SUPERADMIN">Superadmin</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className={`${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-[#3a5a78] hover:bg-[#2d4860]"} text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? "focus:ring-blue-500 focus:ring-offset-gray-900" : "focus:ring-[#3a5a78]"} transition-colors`}
                            >
                                Create Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/superadmin-dashboard")}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

