import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation()

  // 1. Проверяем, есть ли пользователь (залогинен ли)
  const userStr = localStorage.getItem('user')
  
  if (!userStr) {
    // Если не залогинен — кидаем на страницу входа, запоминаем откуда пришел
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // 2. Получаем данные пользователя
  const user = JSON.parse(userStr)

  // 3. Проверяем роль
  if (!allowedRoles.includes(user.role)) {
    // Если роли нет в списке разрешенных — кидаем на страницу "нет доступа"
    return <Navigate to="/unauthorized" replace />
  }

  // 4. Если всё ок — показываем страницу
  return children
}

export default ProtectedRoute