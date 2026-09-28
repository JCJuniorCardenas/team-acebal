import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasValidToken } from '../services/api'

export function ProtectedRoute() {
  const location = useLocation()
  if (!hasValidToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}
