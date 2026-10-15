import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem('user');
  const location = useLocation();

  if (!userStr) {
    // Если не залогинен, кидаем на вход, запоминаем, откуда пришел
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const user = JSON.parse(userStr);

  // Если роли пользователя нет в списке разрешенных для этого маршрута
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; // Или на /dashboard
  }

  return children;
};

export default ProtectedRoute;