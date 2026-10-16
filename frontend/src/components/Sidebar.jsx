import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROLES, MENU_PERMISSIONS } from '../constants/roles';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentRole = user?.role || ROLES.WORKER;

  const menuItems = [
    { name: 'Главная', icon: '📊', path: '/dashboard', permissionKey: 'dashboard' },
    { name: 'Аналитика', icon: '📈', path: '/analytics', permissionKey: 'analytics' },
    { name: 'Списания', icon: '📄', path: '/spisaniya', permissionKey: 'spisaniya' },
    { name: 'Стоп-лист', icon: '🚫', path: '/stoplist', permissionKey: 'stoplist' },
    { name: 'Заказы', icon: '', path: '/priemzk', permissionKey: 'priemzk' },
    { name: 'Блюда', icon: '🍳', path: '/bluda', permissionKey: 'bluda' },
    { name: 'Склад', icon: '📦', path: '/monit', permissionKey: 'monit' },
    { name: 'Поставки', icon: '', path: '/priemps', permissionKey: 'priemps' },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    MENU_PERMISSIONS[item.permissionKey]?.includes(currentRole)
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
          <span className="logo-role">
            {currentRole === 'admin' ? 'Администратор' : 
             currentRole === 'manager' ? 'Менеджер' : 'Сотрудник'}
          </span>
        </div>
      </div>

      <nav className="nav">
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-link logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Выйти</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;