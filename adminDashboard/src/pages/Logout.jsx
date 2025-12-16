import React, { useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import useAppStore from '../state/store'

export default function Logout() {
  const logout = useAppStore((s) => s.logout)
  const isAuthenticated = useAppStore((s) => s.isAuthenticated())
  const navigate = useNavigate()

  useEffect(() => {
    logout()
    // short delay to allow context consumers to update if needed
    const id = setTimeout(() => navigate('/login', { replace: true }), 50)
    return () => clearTimeout(id)
  }, [logout, navigate])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 animate-spin text-indigo-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Signing you out…
      </div>
    </div>
  )
}
