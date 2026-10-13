import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Главная', icon: 'X', path: '/dashboard' },
    { name: 'Поставки', icon: 'X', path: '/priemps' },
    { name: 'Заказы', icon: 'X', path: '/priemzk' },
    { name: 'Склад', icon: 'X', path: '/monit' },
    { name: 'Блюда', icon: 'X', path: '/bluda' },
    { name: 'Стоп-лист', icon: 'X', path: '/stoplist' },
    { name: 'Аналитика', icon: 'X', path: '/analytics' },
    { name: 'Списания', icon: '️X', path: '/spisaniya' },
  ]

  const handleLogout = () => {
    // Очищаем данные авторизации
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Перенаправляем на страницу входа
    navigate('/', { replace: true })
  }

  return (
    <aside className="sidebar">
      <nav className="nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          )
        })}

        {/* Кнопка выхода прижата к низу */}
        <button onClick={handleLogout} className="nav-link logout-btn">
          <span className="nav-icon"></span>
          <span className="nav-text">Выйти</span>
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar