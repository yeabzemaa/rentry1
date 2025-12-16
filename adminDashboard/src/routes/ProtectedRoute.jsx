import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAppStore from '../state/store'

export default function ProtectedRoute({ children }) {
  const token = useAppStore((s) => s.token)
  const loading = useAppStore((s) => s.loading)
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Checking authentication...
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
