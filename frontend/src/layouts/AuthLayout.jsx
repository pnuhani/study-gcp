import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/api';

export default function AuthLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    const verifyToken = async () => {
      try {
        const result = await api.verifyAdminToken();
        setIsAuthenticated(result.valid);
      } catch (err) {
        console.error("Error verifying token:", err);
        localStorage.removeItem("adminToken");
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a5a78]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}