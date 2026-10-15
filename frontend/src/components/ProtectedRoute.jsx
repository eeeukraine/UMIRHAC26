import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation()

  // Проверяем, есть ли пользователь
  let userStr = localStorage.getItem('user')
  
  // ВРЕМЕННЫЙ КОД: если нет пользователя — создаем тестового админа
  if (!userStr && import.meta.env.DEV) {
    const testUser = {
      id: 1,
      name: 'Тестовый Админ',
      role: 'admin', // можешь поменять на 'manager' или 'worker' для теста
      firmId: 1
    }
    localStorage.setItem('user', JSON.stringify(testUser))
    localStorage.setItem('token', 'dev-test-token')
    userStr = JSON.stringify(testUser)
    console.log(' Создан тестовый пользователь:', testUser)
  }

  if (!userStr) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  const user = JSON.parse(userStr)

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute