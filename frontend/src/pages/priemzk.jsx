import React, { useState, useEffect } from 'react'
import './priemzk.css'
import Sidebar from "../components/Sidebar.jsx"

// 🌟 Вспомогательная функция: добавляет токен ко всем запросам
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const ActiveOrders = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [stopList, setStopList] = useState([])
  const [orders, setOrders] = useState([])
  const [dishes, setDishes] = useState([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const handleGenerateOrders = async () => {
    setGenerating(true)
    try {
      await fetch('http://localhost:8080/api/generator/orders?count=3', {
        method: 'POST',
        headers: getAuthHeaders()
      })
      await loadData()
      alert('Сгенерировано 3 случайных заказа!')
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const headers = getAuthHeaders();
      
      const [ordersRes, dishesRes, stopListRes] = await Promise.all([
        fetch('http://localhost:8080/api/orders', { headers }),
        fetch('http://localhost:8080/api/dishes', { headers }),
        fetch('http://localhost:8080/api/stop-list', { headers })
      ])

      const ordersData = await ordersRes.json()
      const dishesData = await dishesRes.json()
      const stopListData = await stopListRes.json()

      setOrders(ordersData)
      setDishes(dishesData)
      setStopList(stopListData)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(newStatus)
      })

      if (response.ok) {
        await loadData()
      }
    } catch (err) {
      console.error('Ошибка обновления статуса:', err)
      alert('Не удалось обновить статус заказа')
    }
  }

  const handleCreateOrder = async (orderData) => {
    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (result.success) {
        await loadData()
        return { success: true, order: result.order }
      } else {
        return { success: false, message: result.message }
      }
    } catch (err) {
      console.error('Ошибка создания заказа:', err)
      return { success: false, message: 'Ошибка при создании заказа' }
    }
  }

  // ✅ ДОБАВЛЕНА СОРТИРОВКА: новые заказы сверху (по дате создания, fallback на ID)
  const filteredOrders = orders
    .filter(order => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'pending') return order.status === 'pending' || order.status === 'new'
      if (activeFilter === 'preparing') return order.status === 'preparing' || order.status === 'cooking'
      if (activeFilter === 'ready') return order.status === 'ready' || order.status === 'completed'
      return order.status === activeFilter
    })
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      
      if (dateB !== dateA) {
        return dateB - dateA; // Сначала новые по дате
      }
      return b.id - a.id; // Если даты равны, сначала новые по ID
    })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
      case 'cooking':
        return <span className="status-badge badge-preparing">🔥 Готовится</span>
      case 'ready':
      case 'completed':
        return <span className="status-badge badge-ready">✅ Готов к выдаче</span>
      case 'cancelled':
        return <span className="status-badge badge-cancelled">❌ Отменен</span>
      default:
        return <span className="status-badge badge-new">Новый</span>
    }
  }

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="supply-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка заказов...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page-layout">
      <Sidebar />
      
      <main className="supply-content">
        <div className="page-wrapper">
          <div className="page-header">
            <h1 className="page-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Активные заказы
            </h1>
            <p className="page-subtitle">Управление текущими заказами, отслеживание статусов и содержимого</p>
          </div>
          
          <button className="btn-primary" onClick={handleGenerateOrders} disabled={generating} style={{ marginLeft: '3em', margin: '1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            {generating ? 'Генерация...' : 'Симулировать заказы'}
          </button>

          <div className="content-grid">
            <div className="left-column">
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  Все ({orders.length})
                </button>
                <button 
                  className={`filter-tab ${activeFilter === 'pending' || activeFilter === 'new' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('pending')}
                >
                  Готовятся ({orders.filter(o => o.status === 'pending' || o.status === 'new').length})
                </button>
                <button 
                  className={`filter-tab ${activeFilter === 'ready' || activeFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('ready')}
                >
                  Готовы ({orders.filter(o => o.status === 'ready' || o.status === 'completed').length})
                </button>
              </div>

              <div className="orders-list">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-meta">
                          <span className="order-id">{order.orderNumber || `ORD-${order.id}`}</span>
                          <span className="order-customer">
                            {order.tableNumber ? `Стол №${order.tableNumber}` : 'Доставка'}
                          </span>
                        </div>
                        <div className="order-right">
                          <span className="order-time"> {new Date(order.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}</span>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="order-body">
                        <h4 className="dishes-title">Состав заказа:</h4>
                        <ul className="dishes-list">
                          {order.items && order.items.map((item, idx) => (
                            <li key={idx} className="dish-row">
                              <span className="dish-qty">x{item.quantity}</span>
                              <span className="dish-name">{item.dishName}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="order-actions">
                        {(order.status === 'pending' || order.status === 'preparing') && (
                          <button 
                            className="action-btn btn-success"
                            onClick={() => handleStatusChange(order.id, 'ready')}
                          >
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Отметить готовым
                          </button>
                        )}
                        {(order.status === 'ready' || order.status === 'completed') && (
                          <button 
                            className="action-btn btn-primary"
                            onClick={() => handleStatusChange(order.id, 'completed')}
                          >
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            Закрыть заказ
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <button 
                            className="action-btn btn-danger"
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                          >
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Отменить
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Нет заказов с выбранным статусом</p>
                  </div>
                )}
              </div>
            </div>

            <div className="right-column">
              <div className="card stoplist-card">
                <div className="card-header">
                  <h2>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Стоп-лист
                  </h2>
                </div>
                <div className="card-body">
                  {stopList.length > 0 ? (
                    <div className="stoplist-items">
                      {stopList.map((item) => (
                        <div key={item.id} className="stoplist-item">
                          <div className="stoplist-info">
                            <p className="stoplist-name">{item.dishName}</p>
                            <p className="stoplist-reason">{item.reason}</p>
                          </div>
                          <div className="stoplist-dot"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <p>Стоп-лист пуст</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ActiveOrders