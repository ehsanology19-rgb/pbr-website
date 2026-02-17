import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, role, loading } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('[ProtectedRoute] User:', user.email, 'Role:', role, 'isAdmin:', isAdmin);
    }
  }, [user, role, isAdmin]);

  if (loading && !user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
  }

  if (role === null) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-subtitle">Verifying access...</p>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
            User: {user.email}
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Access denied</h1>
          <p className="auth-subtitle">You need admin access to view this page.</p>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
            Your role: {role} | User: {user.email}
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
}
