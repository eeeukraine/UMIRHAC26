import React, { useState, useEffect } from 'react'
import './priemzk.css'
import Sidebar from "../components/Sidebar.jsx"

const ActiveOrders = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [stopList, setStopList] = useState([])
  
  // Демо-данные активных заказов
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'Стол №5',
      time: '14:32',
      status: 'preparing',
      dishes: [
        { name: 'Паста Карбонара', quantity: 2 },
        { name: 'Цезарь с курицей', quantity: 1 }
      ]
    },
    {
      id: 'ORD-002',
      customer: 'Доставка #1042',
      time: '14:28',
      status: 'ready',
      dishes: [
        { name: 'Борщ с пампушками', quantity: 1 },
        { name: 'Салат Оливье', quantity: 1 },
        { name: 'Морс клюквенный', quantity: 2 }
      ]
    },
    {
      id: 'ORD-003',
      customer: 'Стол №12',
      time: '14:35',
      status: 'preparing',
      dishes: [
        { name: 'Ризотто с грибами', quantity: 1 },
        { name: 'Тирамису', quantity: 2 }
      ]
    },
    {
      id: 'ORD-004',
      customer: 'Стол №8',
      time: '14:15',
      status: 'cancelled',
      dishes: [
        { name: 'Стейк Рибай', quantity: 1 }
      ]
    }
  ])

  useEffect(() => {
    loadStopList()
  }, [])

  const loadStopList = async () => {
    try {
      setStopList([
        { id: 1, dishName: 'Борщ', reason: 'Нет свеклы' },
        { id: 2, dishName: 'Паста Карбонара', reason: 'Закончилась панчетта' },
      ])
    } catch (err) {
      console.error('Ошибка загрузки стоп-листа:', err)
    }
  }

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
  }

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true
    return order.status === activeFilter
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return <span className="status-badge badge-preparing">🔥 Готовится</span>
      case 'ready':
        return <span className="status-badge badge-ready">✅ Готов к выдаче</span>
      case 'cancelled':
        return <span className="status-badge badge-cancelled">❌ Отменен</span>
      default:
        return <span className="status-badge badge-new">🆕 Новый</span>
    }
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

          <div className="content-grid">
            
            {/* ЛЕВАЯ КОЛОНКА: Список заказов (занимает 3 части) */}
            <div className="left-column">
              
              {/* Фильтры */}
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  Все ({orders.length})
                </button>
                <button 
                  className={`filter-tab ${activeFilter === 'preparing' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('preparing')}
                >
                  Готовятся ({orders.filter(o => o.status === 'preparing').length})
                </button>
                <button 
                  className={`filter-tab ${activeFilter === 'ready' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('ready')}
                >
                  Готовы ({orders.filter(o => o.status === 'ready').length})
                </button>
              </div>

              {/* Список карточек заказов */}
              <div className="orders-list">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-meta">
                          <span className="order-id">{order.id}</span>
                          <span className="order-customer">{order.customer}</span>
                        </div>
                        <div className="order-right">
                          <span className="order-time">🕒 {order.time}</span>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="order-body">
                        <h4 className="dishes-title">Состав заказа:</h4>
                        <ul className="dishes-list">
                          {order.dishes.map((dish, idx) => (
                            <li key={idx} className="dish-row">
                              <span className="dish-qty">x{dish.quantity}</span>
                              <span className="dish-name">{dish.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="order-actions">
                        {order.status === 'preparing' && (
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
                        {order.status === 'ready' && (
                          <button 
                            className="action-btn btn-primary"
                            onClick={() => handleStatusChange(order.id, 'cancelled')} // В реальности тут было бы "Выдан"
                          >
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            Закрыть заказ
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'ready' && (
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

            {/* ПРАВАЯ КОЛОНКА: Стоп-лист (занимает 1 часть) */}
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