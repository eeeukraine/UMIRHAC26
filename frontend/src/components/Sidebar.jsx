import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BarChart3, 
  FileX, 
  Ban, 
  ShoppingCart, 
  UtensilsCrossed, 
  Package, 
  Truck,
  LogOut
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Новый порядок элементов + иконки
  const menuItems = [
    { name: 'Главная', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Аналитика', icon: BarChart3, path: '/analytics' },
    { name: 'Поставки', icon: Truck, path: '/priemps' },
    { name: 'Списания', icon: FileX, path: '/spisaniya' },
    { name: 'Стоп-лист', icon: Ban, path: '/stoplist' },
    { name: 'Заказы', icon: ShoppingCart, path: '/priemzk' },
    { name: 'Блюда', icon: UtensilsCrossed, path: '/bluda' },
    { name: 'Склад', icon: Package, path: '/monit' },

  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  return (
    <aside className="sidebar">
      {/* Шапка сайдбара с логотипом */}
      <div className="sidebar-header">
        <div className="logo-icon">🍽️</div>
        <span className="logo-text">RestoManager</span>
      </div>

      <nav className="nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          const IconComponent = item.icon
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={20} strokeWidth={1.8} />
              <span className="nav-text">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Кнопка выхода, прижатая к низу */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-link logout-btn">
          <LogOut size={20} strokeWidth={1.8} />
          <span className="nav-text">Выйти</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar