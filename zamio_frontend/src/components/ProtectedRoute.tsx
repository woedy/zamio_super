import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Simple auth gate using presence of token in storage
const isAuthed = () => {
  try {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  } catch {
    return false;
  }
};

const ProtectedRoute: React.FC = () => {
  if (!isAuthed()) {
    return <Navigate to="/sign-in" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;

