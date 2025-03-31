import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QrCodeIcon from "@mui/icons-material/QrCode"
import DownloadIcon from "@mui/icons-material/Download"
import RefreshIcon from "@mui/icons-material/Refresh"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import api from "../api/api"

export default function AdminDashboard() {
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [batchSize, setBatchSize] = useState(10)
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem("darkMode") === "true"
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize] = useState(15)
  const [loadedPages, setLoadedPages] = useState({})
  const [loadingPage, setLoadingPage] = useState(null)
  
  const navigate = useNavigate()


  const sortByActiveStatus = (qrCodes) => {
    return [...qrCodes].sort((a, b) => {
      const aIsActive = Boolean(a.isActive);
      const bIsActive = Boolean(b.isActive);
      return aIsActive === bIsActive ? 0 : aIsActive ? -1 : 1;
    });
  };

  useEffect(() => {
    // fetch first 3 pages
    fetchInitialPages()
  }, [] )

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    localStorage.setItem("darkMode", darkMode)
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const fetchInitialPages = async () => {
    setLoading(true)
    try {
      const pagePromises = [0, 1, 2].map(page => api.getQRBatch(page, pageSize))
      const results = await Promise.all(pagePromises)
      console.log("Initial pages loaded:", results);
      
      

      const firstPageData = results[0]
      setQrCodes(sortByActiveStatus( firstPageData.qrCodes || []))
      setTotalItems(firstPageData.totalItems || 0)
      setTotalPages(firstPageData.totalPages || 1)
      
      // Cache all loaded pages
      const newLoadedPages = {}
      results.forEach((result, index) => {
        if (result && result.qrCodes) {
          newLoadedPages[index] = sortByActiveStatus(result.qrCodes)
        }
      })
      setLoadedPages(newLoadedPages)
      
    } catch (err) {
      setError("Failed to load QR codes")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPage = async (page) => {
    
    if (loadedPages[page]) {
      setQrCodes(loadedPages[page])
      setCurrentPage(page)
      return
    }
    

    setLoadingPage(page)
    try {
      const result = await api.getQRBatch(page, pageSize)
      if (result && result.qrCodes) {

        const sortedCodes = sortByActiveStatus(result.qrCodes)

        setQrCodes(sortedCodes)
        
        
        setLoadedPages(prev => ({
          ...prev,
          [page]: sortedCodes

        }))
        

        setTotalItems(result.totalItems || totalItems)
        setTotalPages(result.totalPages || totalPages)
        setCurrentPage(page)
      }
    } catch (err) {
      setError(`Failed to load page ${page + 1}`)
      console.error(err)
    } finally {
      setLoadingPage(null)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchPage(newPage)
    }
  }

  const fetchQRCodes = async () => {
    // Reset pagination and reload all initial pages
    setCurrentPage(0)
    setLoadedPages({})
    fetchInitialPages()
  }

  
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleGenerateBatch = async () => {
    setGenerating(true)
    setError("")
    try {
      const result = await api.generateQRCodeBatch(batchSize)
      if (result.success) {
        fetchQRCodes() 
      } else {
        setError("Failed to generate QR codes")
      }
    } catch (err) {
      setError("An error occurred while generating QR codes")
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (selectedIds.length === 0) {
      setError("Please select at least one QR code to download.")
      return
    }

    setLoading(true)
    try {
      await api.generateQRCodePDF(selectedIds)
      setError("") 
    } catch (err) {
      setError("Failed to download PDF: " + (err.message || "Unknown error"))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === qrCodes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(qrCodes.map((qr) => qr.id))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    navigate("/admin/login")
  }


  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems)

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
    
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b transition-colors duration-200`}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center transition-colors duration-200`}>
            <QrCodeIcon className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'}`} />
            <span>QR Code Management</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </button>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-md transition-colors flex items-center gap-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z"
                  clipRule="evenodd"
                />
                <path d="M4 8a1 1 0 011-1h5a1 1 0 110 2H5a1 1 0 01-1-1z" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center dark:bg-red-900/30 dark:text-red-400 dark:border-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow rounded-lg p-6 mb-6 transition-colors duration-200`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              Generate New QR Codes
            </h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label htmlFor="batchSize" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-200`}>
                  Batch Size
                </label>
                <input
                  type="number"
                  id="batchSize"
                  min="1"
                  max="100"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number.parseInt(e.target.value) || 1)}
                  className={`block w-24 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'border-gray-300 focus:ring-[#3a5a78] focus:border-[#3a5a78]'} px-3 py-2 focus:outline-none shadow-sm transition-colors duration-200`}
                />
              </div>
              <button
                onClick={handleGenerateBatch}
                disabled={generating}
                className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#3a5a78] hover:bg-[#2d4860]'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'focus:ring-blue-500 focus:ring-offset-gray-900' : 'focus:ring-[#3a5a78]'} disabled:opacity-50 transition-colors flex items-center`}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Generate QR Codes
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={selectedIds.length === 0}
                className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#3a5a78] hover:bg-[#2d4860]'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'focus:ring-blue-500 focus:ring-offset-gray-900' : 'focus:ring-[#3a5a78]'} disabled:opacity-50 transition-colors flex items-center`}
              >
                <DownloadIcon className="mr-1" /> Download Selected
              </button>
              <button
                onClick={fetchQRCodes}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Refresh list"
              >
                <RefreshIcon className={darkMode ? 'text-blue-400' : 'text-[#3a5a78]'} />
              </button>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden transition-colors duration-200`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center transition-colors duration-200`}>
              <h2 className={`text-lg font-medium flex items-center ${darkMode ? 'text-white' : ''}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-[#3a5a78]'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                QR Code Inventory
              </h2>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {totalItems > 0 ? `Showing ${startItem}-${endItem} of ${totalItems} QR codes • ` : ''}
                {selectedIds.length} selected
              </div>
            </div>
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-[#3a5a78]'} mb-4`}></div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading QR codes...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === qrCodes.length && qrCodes.length > 0}
                            onChange={toggleSelectAll}
                            className={`h-4 w-4 ${darkMode ? 'text-blue-600 focus:ring-blue-500 border-gray-600' : 'text-[#3a5a78] focus:ring-[#3a5a78] border-gray-300'} rounded`}
                          />
                          <span className="ml-2">Select</span>
                        </div>
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        QR ID
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Created Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Activation Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                    {qrCodes.length > 0 ? (
                      qrCodes.map((qr) => (
                        <tr key={qr.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              id={`qr-${qr.id}`}
                              checked={selectedIds.includes(qr.id)}
                              onChange={() => handleCheckboxChange(qr.id)}
                              className={`h-4 w-4 ${darkMode ? 'text-blue-600 focus:ring-blue-500 border-gray-600' : 'text-[#3a5a78] focus:ring-[#3a5a78] border-gray-300'} rounded`}
                            />
                            <label htmlFor={`qr-${qr.id}`} className="sr-only">
                              Select QR code {qr.id}
                            </label>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{qr.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                qr.isActive 
                                  ? darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800" 
                                  : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {qr.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {qr.createdDate && qr.createdDate !== "null"
                              ? new Date(qr.createdDate).toLocaleDateString()
                              : "Not recorded"}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {qr.activationDate && qr.activationDate !== "null"
                              ? new Date(qr.activationDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/qr/${qr.id}`)}
                                className={`${darkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' : 'text-[#3a5a78] hover:text-[#2d4860] hover:bg-blue-50'} px-2 py-1 rounded transition-colors`}
                              >
                                View
                              </button>
                              {(qr.isActive) && (
                                <button
                                  onClick={() => navigate(`/qr/${qr.id}/edit`)}
                                  className={`${darkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' : 'text-[#3a5a78] hover:text-[#2d4860] hover:bg-blue-50'} px-2 py-1 rounded transition-colors`}
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className={`px-6 py-12 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex flex-col items-center">
                            <QrCodeIcon className={`h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-2`} />
                            <p>No QR codes found. Generate some using the form above.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  
                  <div className={`px-6 py-4 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`relative inline-flex items-center px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} text-sm font-medium rounded-md disabled:opacity-50`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} text-sm font-medium rounded-md disabled:opacity-50`}
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Showing <span className="font-medium">{startItem}</span> to{" "}
                          <span className="font-medium">{endItem}</span> of{" "}
                          <span className="font-medium">{totalItems}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium disabled:opacity-50`}
                          >
                            <span className="sr-only">Previous</span>
                            <NavigateBeforeIcon />
                          </button>
                          
                          {/* Display page numbers */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic for which page numbers to show
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i;
                            } else if (currentPage < 3) {
                              pageNum = i;
                            } else if (currentPage > totalPages - 3) {
                              pageNum = totalPages - 5 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? darkMode 
                                      ? "z-10 bg-blue-600 text-white border-blue-600" 
                                      : "z-10 bg-[#3a5a78] text-white border-[#3a5a78]"
                                    : darkMode
                                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                                      : "bg-white text-gray-500 hover:bg-gray-50 border-gray-300"
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium disabled:opacity-50`}
                          >
                            <span className="sr-only">Next</span>
                            <NavigateNextIcon />
                          </button>
                          
                          {/* Loading indicator for next page */}
                          {loadingPage !== null && (
                            <div className="ml-2 flex items-center">
                              <div className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-[#3a5a78]'}`}></div>
                              <span className={`ml-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading page {loadingPage + 1}...</span>
                            </div>
                          )}
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  )
}

