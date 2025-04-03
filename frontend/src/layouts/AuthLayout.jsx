import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function AuthLayout() {
  const { authState, setAuthState } = useAuth();
  const [loading, setLoading] = useState(!authState.initialized);

  useEffect(() => {
    if (authState.initialized) {
      return;
    }

    const verifyAuth = async () => {
      try {
        const result = await api.verifyAdminToken();
        setAuthState({
          isAuthenticated: result.valid,
          role: result.role,
          initialized: true
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          role: null,
          initialized: true
        });
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a5a78]"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}


