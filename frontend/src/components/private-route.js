import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/sign-in" />
  }

  return children
}

export default PrivateRoute 