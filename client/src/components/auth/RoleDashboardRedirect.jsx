import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleDashboardRedirect = () => {
  const { user } = useAuth();
  const raw = user?.userType;
  const role = typeof raw === 'string' && raw.trim() ? raw : 'user';
  return <Navigate to={`/${role}/dashboard`} replace />;
};

export default RoleDashboardRedirect;


