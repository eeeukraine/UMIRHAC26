import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar.jsx'

// 🌟 Вспомогательная функция для авторизации
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    expiringSoon: 0,
    recipesAtRisk: 0
  });
  const [ordersCount, setOrdersCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // ✅ 1. ПРОВЕРКА: Если токена нет, не делаем запросы
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Токен отсутствует. Перенаправление на вход...');
      navigate('/', { replace: true });
      return;
    }

    try {
      const headers = getAuthHeaders();

      const [warehouseStatsRes, ordersRes, lowStockRes, expiringRes] = await Promise.all([
        fetch('http://localhost:8080/api/warehouse/stats', { headers }),
        fetch('http://localhost:8080/api/orders', { headers }),
        fetch('http://localhost:8080/api/warehouse/low-stock', { headers }),
        fetch('http://localhost:8080/api/warehouse/expiring?days=7', { headers })
      ]);

      // ✅ 2. ПРОВЕРКА: Если хоть один запрос вернул ошибку (401/403)
      if (!warehouseStatsRes.ok || !ordersRes.ok || !lowStockRes.ok || !expiringRes.ok) {
        if (warehouseStatsRes.status === 401 || warehouseStatsRes.status === 403) {
          console.error('Сессия истекла или нет доступа');
          localStorage.clear();
          navigate('/', { replace: true });
          return;
        }
        throw new Error('Ошибка сервера при загрузке данных');
      }

      // ✅ 3. Только теперь безопасно вызываем .json()
      const warehouseStats = await warehouseStatsRes.json();
      const ordersData = await ordersRes.json();
      const lowStock = await lowStockRes.json();
      const expiring = await expiringRes.json();

      // Гарантируем, что ordersData - это массив (на случай если бэк отдает объект { orders: [...] })
      const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);

      // Обновляем статистику
      setStats({
        totalProducts: warehouseStats.totalProducts || 0,
        lowStock: warehouseStats.lowStock || 0,
        expiringSoon: warehouseStats.expiringSoon || 0,
        recipesAtRisk: warehouseStats.recipesAtRisk || 0
      });

      // Считаем заказы
      setOrdersCount(orders.length);
      setPendingOrders(orders.filter(o => o.status === 'new' || o.status === 'pending').length);

      // Берём топ-3 критических остатка
      setLowStockItems(Array.isArray(lowStock) ? lowStock.slice(0, 3) : []);

      // Берём топ-3 истекающих продукта
      setExpiringItems(Array.isArray(expiring) ? expiring.slice(0, 3) : []);

      // Генерируем последнюю активность
      const activity = [];
      orders.slice(-2).forEach(order => {
        activity.push({
          type: 'order',
          title: `Заказ ${order.orderNumber || `ORD-${order.id}`}`,
          meta: `Стол №${order.tableNumber || '?'} • ${order.items?.length || 0} позиций • ${new Date(order.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}`,
          link: '/priemzk'
        });
      });

      if (lowStock.length > 0) {
        activity.push({
          type: 'warning',
          title: 'Критический остаток на складе',
          meta: `${lowStock[0].name} • Осталось: ${lowStock[0].currentQuantity} ${lowStock[0].unit}`,
          link: '/monit'
        });
      }

      setRecentActivity(activity);

    } catch (err) {
      console.error('Ошибка загрузки дашборда:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p>Загрузка дашборда...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-gradient">Обзор системы</span>
            </h1>
          </div>
          <div className="header-actions">
            <div className="date-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </header>

        {/* KPI СЕТКА */}
        <section className="kpi-grid kpi-grid-2">
          <Link to="/monit" className="kpi-card kpi-clickable">
            <div className="kpi-glow emerald"></div>
            <div className="kpi-icon-wrapper emerald">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Склад</span>
              <span className="kpi-value">{stats.totalProducts}</span>
              <span className="kpi-subtitle">позиций на складе</span>
              <div className="kpi-trend positive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                <span>{stats.lowStock} требуют внимания</span>
              </div>
            </div>
            <div className="kpi-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </Link>

          <Link to="/priemzk" className="kpi-card kpi-clickable">
            <div className="kpi-glow amber"></div>
            <div className="kpi-icon-wrapper amber">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Заказы</span>
              <span className="kpi-value">{ordersCount}</span>
              <span className="kpi-subtitle">активных заказов</span>
              <div className="kpi-trend neutral">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{pendingOrders} ожидают подтверждения</span>
              </div>
            </div>
            <div className="kpi-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </Link>
        </section>

        {/* ПОСЛЕДНЯЯ АКТИВНОСТЬ */}
        <section className="activity-section">
          <div className="data-panel full-width">
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <div className="panel-icon info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h3>Последняя активность</h3>
              </div>
              <div className="panel-tabs">
                <Link to="/priemps" className="tab-link active">Поставки</Link>
                <Link to="/priemzk" className="tab-link">Заказы</Link>
              </div>
            </div>
            <div className="panel-body activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="activity-row">
                    <div className={`activity-icon ${activity.type === 'order' ? 'blue' : 'amber'}`}>
                      {activity.type === 'order' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      )}
                    </div>
                    <div className="activity-details">
                      <span className="activity-title">{activity.title}</span>
                      <span className="activity-meta">{activity.meta}</span>
                    </div>
                    <Link to={activity.link} className="activity-link">
                      Детали
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                  Нет недавней активности
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ЗОНЫ ДЕЙСТВИЯ */}
        <section className="action-grid">
          <div className="data-panel">
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <div className="panel-icon critical">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3>Критические остатки</h3>
              </div>
              <Link to="/stoplist" className="panel-link">
                Стоп-лист
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
            <div className="panel-body">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item, idx) => (
                  <div key={idx} className="critical-item">
                    <div className={`critical-badge ${item.priority === 'critical' ? 'critical' : 'warning'}`}>
                      <span className="badge-dot"></span>
                      <span>{item.priority === 'critical' ? 'Критично' : 'Мало'}</span>
                    </div>
                    <div className="critical-info">
                      <span className="critical-name">{item.name}</span>
                      <span className="critical-desc">
                        Остаток: {item.currentQuantity} {item.unit} • 
                        Нужно: {item.minQuantity} {item.unit}
                      </span>
                    </div>
                    <Link to="/monit" className="critical-action">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Заказать
                    </Link>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  Нет критических остатков
                </div>
              )}
            </div>
          </div>

          <div className="data-panel">
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <div className="panel-icon warning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3>Истекающий срок годности</h3>
              </div>
              <Link to="/spisaniya" className="panel-link">
                Все списания
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
            <div className="panel-body">
              {expiringItems.length > 0 ? (
                expiringItems.map((batch, idx) => {
                  const daysLeft = Math.ceil((new Date(batch.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={idx} className="expiring-item">
                      <div className={`expiring-days ${daysLeft <= 3 ? 'bad' : 'warning'}`}>
                        <span className="days-value">{daysLeft}</span>
                        <span className="days-label">дн.</span>
                      </div>
                      <div className="expiring-info">
                        <span className="expiring-name">{batch.productName}</span>
                        <span className="expiring-desc">
                          Партия #{batch.id} • {batch.quantity} {batch.unit || 'кг'}
                        </span>
                      </div>
                      <Link to="/spisaniya" className="expiring-action">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        Использовать
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  Нет истекающих продуктов
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;