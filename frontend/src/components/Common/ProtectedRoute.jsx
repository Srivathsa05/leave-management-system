import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ CORRECT



const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth(); 

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/employee" replace />;
  }

  if (!adminOnly && user.role !== 'employee') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
