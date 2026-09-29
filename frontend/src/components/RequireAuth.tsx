import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Spinner } from './States'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}

/** Guest pages; once signed in, sends the user to the page they originally wanted. */
export function GuestOnly() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    const fallback = location.pathname === '/register' ? '/discover' : '/feed'
    return <Navigate to={from ?? fallback} replace />
  }
  return <Outlet />
}
