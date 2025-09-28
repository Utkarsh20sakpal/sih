import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, userType, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role (only if role info is available)
  if (userType && user && user.userType && user.userType !== userType) {
    // Redirect to appropriate dashboard based on user type (with safe fallback)
    const role = typeof user.userType === 'string' && user.userType.trim() ? user.userType : 'user';
    const dashboardPath = `/${role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  // Check if user has any of the allowed roles
  if (allowedRoles && user && user.userType && !allowedRoles.includes(user.userType)) {
    // Redirect to appropriate dashboard based on user type (with safe fallback)
    const role = typeof user.userType === 'string' && user.userType.trim() ? user.userType : 'user';
    const dashboardPath = `/${role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
