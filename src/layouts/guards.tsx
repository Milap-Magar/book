import { Navigate, Outlet, useLocation } from 'react-router'
import { EmptyState, LoadingState } from '@/components/States'
import { useSession } from '@/lib/session'

/**
 * These guards only decide what the UI shows. The backend enforces the real rules:
 * a user who edits the JavaScript still gets 401/403 from the API.
 */
export function RequireAuth() {
  const { status } = useSession()
  const location = useLocation()

  // Wait for the session restore, otherwise a reload on a protected page bounces to /login.
  if (status === 'loading') return <LoadingState />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

export function RequireAdmin() {
  const { user } = useSession()
  if (user?.role !== 'ADMIN') {
    return <EmptyState title="Admins only" hint="Your account does not have access to this area." />
  }
  return <Outlet />
}
