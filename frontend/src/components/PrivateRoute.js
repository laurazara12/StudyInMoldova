import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" />
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" />
    } else {
      return <Navigate to="/profile" />
    }
  }

  if (user.role !== 'admin' && window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/profile" />
  }

  if (user.role === 'admin' && !window.location.pathname.startsWith('/admin') && window.location.pathname !== '/dashboard') {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default PrivateRoute 