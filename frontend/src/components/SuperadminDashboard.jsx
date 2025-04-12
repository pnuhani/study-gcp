import { Link, useNavigate } from "react-router-dom"
import api from "../api/api"
import Header from "./Header"

export default function SuperadminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg h-96 p-4 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Admin Management</h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/superadmin-dashboard/admin-dashboard"
                      className="block px-4 py-2 rounded bg-blue-50 dark:bg-blue-900/30 text-[#3a5a78] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                    >
                      View QR Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/superadmin-dashboard/admins"
                      className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700   text-gray-800 dark:text-gray-200 transition-colors"
                    >
                      View Admins
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/superadmin-dashboard/admins/create"
                      className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors" 
                    >
                      Create New Admin
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

