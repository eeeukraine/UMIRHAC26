import React from 'react'
import { Link } from 'react-router-dom'

const UnauthorizedPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center'
    }}>
      <h1>⛔ Доступ запрещен</h1>
      <p>У вас нет прав для просмотра этой страницы</p>
      <Link to="/dashboard" style={{ 
        marginTop: '20px',
        padding: '10px 20px',
        background: '#3b82f6',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px'
      }}>
        Вернуться на главную
      </Link>
    </div>
  )
}

export default UnauthorizedPage