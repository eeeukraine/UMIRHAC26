import React, { useState, useEffect } from 'react'
import './monit.css'
import Sidebar from "../components/Sidebar.jsx"

const Monit = () => {
  const [inventory, setInventory] = useState([])
  const [suggestedDeliveries, setSuggestedDeliveries] = useState([])
  const [affectedRecipes, setAffectedRecipes] = useState([])
  const [expiringSoon, setExpiringSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Состояние для открытых панелей (по умолчанию все открыты для удобства)
  const [activeViews, setActiveViews] = useState({
    inventory: true,
    deliveries: true,
    expiring: true,
    recipes: true
  })

  useEffect(() => {
    loadMonitoringData()
  }, [])

  const loadMonitoringData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockInventory = [
        { id: 1, name: 'Молоко 3.2%', quantity: 15, unit: 'л', minQuantity: 20, status: 'low', expirationDate: '2025-05-15' },
        { id: 2, name: 'Куриное филе', quantity: 8, unit: 'кг', minQuantity: 10, status: 'low', expirationDate: '2025-05-12' },
        { id: 3, name: 'Помидоры', quantity: 25, unit: 'кг', minQuantity: 15, status: 'ok', expirationDate: '2025-05-25' },
        { id: 4, name: 'Сыр моцарелла', quantity: 5, unit: 'кг', minQuantity: 8, status: 'low', expirationDate: '2025-05-20' },
        { id: 5, name: 'Базилик', quantity: 2, unit: 'кг', minQuantity: 3, status: 'critical', expirationDate: '2025-05-08' },
      ]

      const mockDeliveries = [
        { id: 1, productName: 'Молоко 3.2%', suggestedQuantity: 25, unit: 'л', priority: 'high' },
        { id: 2, productName: 'Куриное филе', suggestedQuantity: 15, unit: 'кг', priority: 'high' },
        { id: 3, productName: 'Сыр моцарелла', suggestedQuantity: 10, unit: 'кг', priority: 'medium' },
        { id: 4, productName: 'Базилик', suggestedQuantity: 5, unit: 'кг', priority: 'critical' },
      ]

      const mockRecipes = [
        { id: 1, name: 'Паста Карбонара', missingProducts: ['Молоко 3.2%', 'Сыр моцарелла'] },
        { id: 2, name: 'Цезарь с курицей', missingProducts: ['Куриное филе', 'Базилик'] },
        { id: 3, name: 'Капрезе', missingProducts: ['Сыр моцарелла', 'Базилик'] },
      ]

      // Вычисляем продукты, истекающие в течение 7 дней
      const today = new Date()
      const mockExpiring = mockInventory.filter(item => {
        const expDate = new Date(item.expirationDate)
        const diffTime = expDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7 && diffDays >= 0
      }).map(item => {
        const expDate = new Date(item.expirationDate)
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
        return { ...item, daysLeft: diffDays }
      })

      setInventory(mockInventory)
      setSuggestedDeliveries(mockDeliveries)
      setAffectedRecipes(mockRecipes)
      setExpiringSoon(mockExpiring)
      setLastUpdate(new Date().toLocaleString('ru-RU'))
    } catch (err) {
      console.error('Ошибка загрузки данных мониторинга:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleView = (key) => {
    setActiveViews(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'status-ok'
      case 'low': return 'status-low'
      case 'critical': return 'status-critical'
      default: return 'status-ok'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'priority-critical'
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      default: return 'priority-low'
    }
  }

  // Подсчет активных панелей для динамической сетки
  const activeCount = Object.values(activeViews).filter(Boolean).length

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="supply-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка данных мониторинга...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Мониторинг остатков
            </h1>
            <p className="page-subtitle">
              Нажмите на карточку статистики, чтобы развернуть или свернуть соответствующий список
              {lastUpdate && <span className="last-update"> • Обновлено: {lastUpdate}</span>}
            </p>
          </div>

          {/* Статистика (теперь кликабельная) */}
          <div className="stats-grid">
            <div 
              className={`stat-card ${activeViews.inventory ? 'active' : ''}`} 
              onClick={() => toggleView('inventory')}
            >
              <div className="stat-icon stat-icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Всего продуктов</p>
                <p className="stat-value">{inventory.length}</p>
              </div>
            </div>

            <div 
              className={`stat-card ${activeViews.deliveries ? 'active' : ''}`} 
              onClick={() => toggleView('deliveries')}
            >
              <div className="stat-icon stat-icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Требуют поставки</p>
                <p className="stat-value">{suggestedDeliveries.length}</p>
              </div>
            </div>

            <div 
              className={`stat-card ${activeViews.expiring ? 'active' : ''}`} 
              onClick={() => toggleView('expiring')}
            >
              <div className="stat-icon stat-icon-amber">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Близко к истечению</p>
                <p className="stat-value">{expiringSoon.length}</p>
              </div>
            </div>

            <div 
              className={`stat-card ${activeViews.recipes ? 'active' : ''}`} 
              onClick={() => toggleView('recipes')}
            >
              <div className="stat-icon stat-icon-purple">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Рецепты под угрозой</p>
                <p className="stat-value">{affectedRecipes.length}</p>
              </div>
            </div>
          </div>

          {/* Динамическая сетка списков */}
          {activeCount > 0 ? (
            <div 
              className="dynamic-lists-grid" 
              style={{ gridTemplateColumns: `repeat(${activeCount}, minmax(0, 1fr))` }}
            >
              {/* 1. Остатки продуктов */}
              {activeViews.inventory && (
                <div className="card list-panel">
                  <div className="card-header">
                    <h2>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Все продукты
                    </h2>
                  </div>
                  <div className="card-body scrollable-body">
                    <div className="inventory-list">
                      {inventory.map((item) => (
                        <div key={item.id} className={`inventory-item ${getStatusColor(item.status)}`}>
                          <div className="inventory-info">
                            <p className="inventory-name">{item.name}</p>
                            <p className="inventory-details">
                              <span className="inventory-quantity">{item.quantity} {item.unit}</span>
                              <span className="inventory-min">мин: {item.minQuantity} {item.unit}</span>
                              <span className="inventory-expiration">
                                срок: {new Date(item.expirationDate).toLocaleDateString('ru-RU')}
                              </span>
                            </p>
                          </div>
                          <div className={`inventory-status status-${item.status}`}>
                            {item.status === 'ok' && '✓ Достаточно'}
                            {item.status === 'low' && '⚠ Мало'}
                            {item.status === 'critical' && '✗ Критично'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Рекомендуемая поставка */}
              {activeViews.deliveries && (
                <div className="card list-panel">
                  <div className="card-header card-header-red">
                    <h2>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Требуется поставка
                    </h2>
                  </div>
                  <div className="card-body scrollable-body">
                    {suggestedDeliveries.length > 0 ? (
                      <div className="deliveries-list">
                        {suggestedDeliveries.map((delivery) => (
                          <div key={delivery.id} className={`delivery-item ${getPriorityColor(delivery.priority)}`}>
                            <div className="delivery-info">
                              <p className="delivery-product">{delivery.productName}</p>
                              <p className="delivery-quantity">{delivery.suggestedQuantity} {delivery.unit}</p>
                            </div>
                            <span className={`delivery-priority priority-${delivery.priority}`}>
                              {delivery.priority === 'critical' && 'Критично'}
                              {delivery.priority === 'high' && 'Высокий'}
                              {delivery.priority === 'medium' && 'Средний'}
                              {delivery.priority === 'low' && 'Низкий'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <p>Все продукты в наличии</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Истекающие сроки */}
              {activeViews.expiring && (
                <div className="card list-panel">
                  <div className="card-header card-header-amber">
                    <h2>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Истекают в течение 7 дней
                    </h2>
                  </div>
                  <div className="card-body scrollable-body">
                    {expiringSoon.length > 0 ? (
                      <div className="expiring-list">
                        {expiringSoon.map((item) => (
                          <div key={item.id} className="expiring-item">
                            <div className="expiring-info">
                              <p className="expiring-name">{item.name}</p>
                              <p className="expiring-date">Годен до: {new Date(item.expirationDate).toLocaleDateString('ru-RU')}</p>
                            </div>
                            <span className={`expiring-badge ${item.daysLeft <= 3 ? 'critical' : 'warning'}`}>
                              {item.daysLeft} дн.
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <p>Нет продуктов с истекающим сроком</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Рецепты под угрозой */}
              {activeViews.recipes && (
                <div className="card list-panel">
                  <div className="card-header card-header-purple">
                    <h2>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Рецепты под угрозой
                    </h2>
                  </div>
                  <div className="card-body scrollable-body">
                    {affectedRecipes.length > 0 ? (
                      <div className="recipes-list">
                        {affectedRecipes.map((recipe) => (
                          <div key={recipe.id} className="recipe-item">
                            <p className="recipe-name">{recipe.name}</p>
                            <div className="recipe-missing">
                              <span className="missing-label">Не хватает:</span>
                              {recipe.missingProducts.map((product, idx) => (
                                <span key={idx} className="missing-product">
                                  {product}{idx < recipe.missingProducts.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <p>Нет рецептов под угрозой</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="all-closed-state">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p>Нажмите на любую карточку статистики выше, чтобы просмотреть детали</p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default Monit