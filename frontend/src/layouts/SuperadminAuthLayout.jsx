import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import api from '../api/api';

export default function SuperadminAuthLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSuperadmin, setIsSuperadmin] = useState(false);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const result = await api.verifyAdminToken();
                if (result.success) {
                    setIsAuthenticated(true);
                    setIsSuperadmin(result.role === 'SUPERADMIN');
                } else {
                    setIsAuthenticated(false);
                    setIsSuperadmin(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setIsSuperadmin(false);
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

    if (!isAuthenticated || !isSuperadmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
