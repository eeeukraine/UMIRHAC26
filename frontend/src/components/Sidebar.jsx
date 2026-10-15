import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, FileX, Ban, ShoppingCart, 
  UtensilsCrossed, Package, Truck, LogOut 
} from 'lucide-react';
import { ROLES, MENU_PERMISSIONS } from '../constants/roles'; // Импортируем конфиг
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем данные пользователя
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentRole = user?.role || ROLES.WORKER; // Fallback на случай ошибки

  const menuItems = [
    { name: 'Главная', icon: LayoutDashboard, path: '/dashboard', permissionKey: 'dashboard' },
    { name: 'Аналитика', icon: BarChart3, path: '/analytics', permissionKey: 'analytics' },
    { name: 'Списания', icon: FileX, path: '/spisaniya', permissionKey: 'spisaniya' },
    { name: 'Стоп-лист', icon: Ban, path: '/stoplist', permissionKey: 'stoplist' },
    { name: 'Заказы', icon: ShoppingCart, path: '/priemzk', permissionKey: 'priemzk' },
    { name: 'Блюда', icon: UtensilsCrossed, path: '/bluda', permissionKey: 'bluda' },
    { name: 'Склад', icon: Package, path: '/monit', permissionKey: 'monit' },
    { name: 'Поставки', icon: Truck, path: '/priemps', permissionKey: 'prieemps' },
  ];

  // ФИЛЬТРАЦИЯ: оставляем только те пункты, где роль пользователя разрешена
  const visibleMenuItems = menuItems.filter(item => 
    MENU_PERMISSIONS[item.permissionKey].includes(currentRole)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">🍽️</div>
        <div className="logo-text-container">
          <span className="logo-text">RestoManager</span>
          <span className="logo-role">{currentRole === 'admin' ? 'Администратор' : currentRole === 'manager' ? 'Менеджер' : 'Сотрудник'}</span>
        </div>
      </div>

      <nav className="nav">
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={20} strokeWidth={1.8} />
              <span className="nav-text">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-link logout-btn">
          <LogOut size={20} strokeWidth={1.8} />
          <span className="nav-text">Выйти</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;