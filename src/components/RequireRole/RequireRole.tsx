import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { homeFor } from '../../features/auth/home';

/** Route guard: redirects to /login when unauthenticated, to the account's
 *  own space when the role is insufficient. Presentational routes never
 *  check auth themselves. */
export function RequireRole({ role, children }: { role?: string; children: ReactNode }) {
  const { userId, roles, signedOut } = useAuthStore();
  const location = useLocation();

  if (!userId) {
    // A page opened while signed out is reopened after signing in; the page
    // just left by signing out is not.
    return <Navigate to="/login" state={signedOut ? undefined : { from: location.pathname }} replace />;
  }
  if (role && !roles.includes(role)) {
    return <Navigate to={homeFor(roles)} replace />;
  }
  return <>{children}</>;
}
