import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { canAccess, type Role } from '../services/permissoes';

export default function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  let role: Role | undefined; let escolaId: number | null | undefined;
  try { const u = JSON.parse(localStorage.getItem('usuario') || '{}'); role = u.tipo; escolaId = u.escolaId ?? u.escola?.id; } catch { role = undefined; }
  // Diretor recém-cadastrado precisa cadastrar a escola antes de usar o sistema.
  if (role === 'DIRETOR' && !escolaId && location.pathname !== '/escola/nova') return <Navigate to="/escola/nova" replace />;
  if (roles && (!role || !roles.includes(role))) return <Navigate to="/dashboard" replace />;
  if (!canAccess(role, location.pathname)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
