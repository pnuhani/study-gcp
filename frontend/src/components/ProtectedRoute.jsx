import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ children, requireRole }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdTokenResult();
        const userRole = idToken.claims.role;
        
        // Check if user has required role (if specified)
        setAuthorized(
          requireRole ? userRole === requireRole : true
        );
      } else {
        setAuthorized(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requireRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a5a78]"></div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireRole: PropTypes.string
};
