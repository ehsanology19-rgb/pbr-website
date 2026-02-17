import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protects a route so only authenticated admin users can access it.
 * Redirects to /account if authenticated but not admin.
 * Redirects to /login if not authenticated.
 */
export default function AdminRoute({ children }) {
  const { user, loading, isAdmin, adminLoading } = useAuth();
  const location = useLocation();

  if (loading || adminLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-subtitle">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
