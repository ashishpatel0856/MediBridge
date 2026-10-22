import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultRoute = user.role === 'DOCTOR'
      ? '/doctor/dashboard'
      : user.role === 'ADMIN'
      ? '/admin/dashboard'
      : '/patient/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}
