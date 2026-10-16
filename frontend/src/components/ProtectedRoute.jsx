import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation()
  const userStr = localStorage.getItem('user')
  const token = localStorage.getItem('token')

  // Если не залогинен
  if (!userStr || !token) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  const user = JSON.parse(userStr)

  // Если роль не подходит
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute