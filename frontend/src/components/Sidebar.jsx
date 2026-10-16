import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { ROLES, MENU_PERMISSIONS } from '../constants/roles';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentRole = user?.role || ROLES.WORKER;

  const menuItems = [
    { name: 'Главная', icon: LayoutDashboard, path: '/dashboard', permissionKey: 'dashboard' },
    { name: 'Аналитика', icon: BarChart3, path: '/analytics', permissionKey: 'analytics' },
    { name: 'Списания', icon: FileX, path: '/spisaniya', permissionKey: 'spisaniya' },
    { name: 'Стоп-лист', icon: Ban, path: '/stoplist', permissionKey: 'stoplist' },
    { name: 'Заказы', icon: ShoppingCart, path: '/priemzk', permissionKey: 'priemzk' },
    { name: 'Блюда', icon: UtensilsCrossed, path: '/bluda', permissionKey: 'bluda' },
    { name: 'Склад', icon: Package, path: '/monit', permissionKey: 'monit' },
    { name: 'Поставки', icon: Truck, path: '/priemps', permissionKey: 'priemps' },
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
        {/* Иконка куба как на странице входа */}
        <div className="logo-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div className="logo-text-container">
          <span className="logo-text">Restock</span>
          <span className="logo-role">
            {currentRole === 'admin' ? 'Администратор' : 
             currentRole === 'manager' ? 'Менеджер' : 'Сотрудник'}
          </span>
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
              <IconComponent size={20} strokeWidth={1.8} className="nav-icon" />
              <span className="nav-text">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-link logout-btn">
          <LogOut size={20} strokeWidth={1.8} className="nav-icon" />
          <span className="nav-text">Выйти</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;