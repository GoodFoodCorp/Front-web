import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/** Route guard: redirects to /login when unauthenticated, to / when the role
 *  is insufficient. Presentational routes never check auth themselves. */
export function RequireRole({ role, children }: { role?: string; children: ReactNode }) {
  const { accessToken, roles } = useAuthStore();
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (role && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
