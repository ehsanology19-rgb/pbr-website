import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show minimal loading state - dashboard can render while role is being fetched
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

  // If user exists but role is still loading, render dashboard with default access
  // Role check will happen when role is fetched
  if (!isAdmin) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Access denied</h1>
          <p className="auth-subtitle">You need admin access to view this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
}