import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { canAccess, type Role } from '../services/permissoes';

export default function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  let role: Role | undefined;
  try { role = JSON.parse(localStorage.getItem('usuario') || '{}').tipo; } catch { role = undefined; }
  if (roles && (!role || !roles.includes(role))) return <Navigate to="/dashboard" replace />;
  if (!canAccess(role, location.pathname)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
