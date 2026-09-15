import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/** Halaman yang butuh sesi login pelanggan. */
export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

/** Halaman login/register: kalau sudah login, lempar ke dashboard. */
export function GuestOnly({ children }) {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
