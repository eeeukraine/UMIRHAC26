import React, { useState, useEffect, useMemo } from 'react'
import './monit.css'
import Sidebar from "../components/Sidebar.jsx"
import { Search } from 'lucide-react'

// 🌟 Вспомогательная функция: добавляет токен ко всем запросам
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const getLocalTodayStr = () => new Date().toLocaleDateString('sv-SE');

const isExpired = (dateStr) => {
  if (!dateStr) return false;
  return String(dateStr).substring(0, 10) <= getLocalTodayStr();
};

const getDaysLeft = (dateStr) => {
  if (!dateStr) return 999;
  const cleanDate = String(dateStr).substring(0, 10);
  const today = getLocalTodayStr();
  const [y1, m1, d1] = cleanDate.split('-').map(Number);
  const [y2, m2, d2] = today.split('-').map(Number);
  const expDate = new Date(y1, m1 - 1, d1);
  const todayDate = new Date(y2, m2 - 1, d2);
  return Math.ceil((expDate - todayDate) / (1000 * 60 * 60 * 24));
};

const USE_MOCK_DATA = false

const getDateOffset = (daysOffset) => {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().split('T')[0]
}

const MOCK_API_RESPONSES = {
  products: [
    { id: 1, name: 'Мука пшеничная в/с', category: 'Бакалея', unit: 'кг', minStock: 10, batches: [{ id: 101, quantity: 25, expirationDate: getDateOffset(30), batchNumber: 'B-001' }] },
    { id: 2, name: 'Молоко 3.2%', category: 'Молочные продукты', unit: 'л', minStock: 10, batches: [{ id: 102, quantity: 3, expirationDate: getDateOffset(2), batchNumber: 'B-002' }] },
    { id: 3, name: 'Масло сливочное 82.5%', category: 'Молочные продукты', unit: 'кг', minStock: 5, batches: [{ id: 103, quantity: 2, expirationDate: getDateOffset(-2), batchNumber: 'B-003' }, { id: 104, quantity: 4, expirationDate: getDateOffset(15), batchNumber: 'B-004' }] },
    { id: 4, name: 'Яйцо куриное С1', category: 'Бакалея', unit: 'шт', minStock: 50, batches: [{ id: 105, quantity: 10, expirationDate: getDateOffset(5), batchNumber: 'B-005' }] },
    { id: 5, name: 'Помидоры черри', category: 'Овощи', unit: 'кг', minStock: 5, batches: [{ id: 106, quantity: 2, expirationDate: getDateOffset(1), batchNumber: 'B-006' }] },
    { id: 6, name: 'Лосось филе', category: 'Рыба', unit: 'кг', minStock: 3, batches: [{ id: 107, quantity: 5, expirationDate: getDateOffset(4), batchNumber: 'B-007' }] },
  ],
  lowStock: [
    { id: 2, name: 'Молоко 3.2%', unit: 'л', currentQuantity: 3, minQuantity: 10, suggestedQuantity: 15, priority: 'high' },
    { id: 4, name: 'Яйцо куриное С1', unit: 'шт', currentQuantity: 10, minQuantity: 50, suggestedQuantity: 100, priority: 'critical' },
    { id: 5, name: 'Помидоры черри', unit: 'кг', currentQuantity: 2, minQuantity: 5, suggestedQuantity: 5, priority: 'medium' }
  ],
  expiring: [
    { id: 102, productName: 'Молоко 3.2%', quantity: 3, unit: 'л', expirationDate: getDateOffset(2), batchNumber: 'B-002' },
    { id: 103, productName: 'Масло сливочное 82.5%', quantity: 2, unit: 'кг', expirationDate: getDateOffset(-2), batchNumber: 'B-003' },
    { id: 105, productName: 'Яйцо куриное С1', quantity: 10, unit: 'шт', expirationDate: getDateOffset(5), batchNumber: 'B-005' },
    { id: 106, productName: 'Помидоры черри', quantity: 2, unit: 'кг', expirationDate: getDateOffset(1), batchNumber: 'B-006' }
  ],
  stats: { totalProducts: 6, lowStockCount: 3 },
  atRisk: [
    { id: 1, name: 'Блины классические', missingProducts: ['Молоко 3.2%', 'Яйцо куриное С1'] },
    { id: 2, name: 'Салат Капрезе', missingProducts: ['Помидоры черри'] }
  ]
}

const Monit = () => {
  const [inventory, setInventory] = useState([])
  const [suggestedDeliveries, setSuggestedDeliveries] = useState([])
  const [affectedRecipes, setAffectedRecipes] = useState([])
  const [expiringSoon, setExpiringSoon] = useState([])
  const [expiredBatches, setExpiredBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // 🔥 ТЕПЕРЬ ВСЕ ВКЛАДКИ ИЗНАЧАЛЬНО ЗАКРЫТЫ
  const [activeViews, setActiveViews] = useState({
    inventory: false,
    deliveries: false,
    expiring: false,
    recipes: false
  })

  useEffect(() => {
    loadMonitoringData()
  }, [])

  const loadMonitoringData = async () => {
    setLoading(true)
    try {
      let products, lowStock, expiring, stats, atRisk

      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 600))
        products = MOCK_API_RESPONSES.products
        lowStock = MOCK_API_RESPONSES.lowStock
        expiring = MOCK_API_RESPONSES.expiring
        stats = MOCK_API_RESPONSES.stats
        atRisk = MOCK_API_RESPONSES.atRisk
      } else {
        const headers = getAuthHeaders()
        const [productsRes, lowStockRes, expiringRes, statsRes, atRiskRes] = await Promise.all([
          fetch('http://localhost:8080/api/warehouse/products', { headers }),
          fetch('http://localhost:8080/api/warehouse/low-stock', { headers }),
          fetch('http://localhost:8080/api/warehouse/expiring?days=30', { headers }),
          fetch('http://localhost:8080/api/warehouse/stats', { headers }),
          fetch('http://localhost:8080/api/warehouse/at-risk-recipes', { headers })
        ])
        products = await productsRes.json()
        lowStock = await lowStockRes.json()
        expiring = await expiringRes.json()
        stats = await statsRes.json()
        atRisk = await atRiskRes.json()
      }

      const inventoryData = products.map(product => {
        const freshBatches = product.batches.filter(b => !isExpired(b.expirationDate))
        const totalQty = parseFloat((freshBatches.reduce((sum, b) => sum + b.quantity, 0)).toFixed(2))
        
        const earliestBatch = freshBatches.length > 0 
          ? freshBatches.reduce((min, b) => getDaysLeft(b.expirationDate) < getDaysLeft(min.expirationDate) ? b : min)
          : null

        let status = 'ok'
        if (totalQty < product.minStock) status = totalQty < product.minStock * 0.3 ? 'critical' : 'low'
        if (product.batches.some(b => isExpired(b.expirationDate))) status = 'critical'

        return {
          id: product.id,
          name: product.name,
          category: product.category || 'Без категории',
          quantity: totalQty,
          unit: product.unit,
          minQuantity: product.minStock,
          status,
          expirationDate: earliestBatch ? earliestBatch.expirationDate : null,
          batches: product.batches,
          hasExpired: product.batches.some(b => isExpired(b.expirationDate))
        }
      })

      setInventory(inventoryData)
      setSuggestedDeliveries(lowStock.map(p => ({ id: p.id, productName: p.name, suggestedQuantity: p.suggestedQuantity, currentQuantity: p.currentQuantity, minQuantity: p.minQuantity, unit: p.unit, priority: p.priority })))
      setExpiringSoon(expiring.filter(b => { const d = getDaysLeft(b.expirationDate); return d >= 1 && d <= 7 }).map(b => ({ id: b.id, name: b.productName, quantity: parseFloat(b.quantity.toFixed(2)), unit: b.unit, expirationDate: b.expirationDate, daysLeft: getDaysLeft(b.expirationDate), batchNumber: b.batchNumber })))
      setExpiredBatches(expiring.filter(b => isExpired(b.expirationDate)).map(b => ({ id: b.id, name: b.productName, quantity: parseFloat(b.quantity.toFixed(2)), unit: b.unit, expirationDate: b.expirationDate, daysLeft: getDaysLeft(b.expirationDate), batchNumber: b.batchNumber })))
      setAffectedRecipes(atRisk.map(r => ({ id: r.id, name: r.name, missingProducts: r.missingProducts })))
      setLastUpdate(new Date().toLocaleString('ru-RU'))
    } catch (err) {
      console.error('Ошибка загрузки данных мониторинга:', err)
    } finally {
      setLoading(false)
    }
  }

  // 🔥 ЛОГИКА: ОТКРЫВАЕТСЯ ТОЛЬКО ОДНА ВКЛАДКА
  const toggleView = (key) => {
    setActiveViews(prev => {
      if (prev[key]) {
        // Если уже открыта — закрываем её
        return { ...prev, [key]: false }
      }
      // Иначе закрываем ВСЕ, и открываем только ту, на которую кликнули
      return {
        inventory: key === 'inventory',
        deliveries: key === 'deliveries',
        expiring: key === 'expiring',
        recipes: key === 'recipes'
      }
    })
  }

  const processedInventory = useMemo(() => {
    let result = [...inventory]
    if (selectedCategory !== 'Все') {
      result = result.filter(item => item.category === selectedCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item => item.name.toLowerCase().includes(q))
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key]
        let valB = b[sortConfig.key]
        if (typeof valA === 'string') {
          valA = valA.toLowerCase()
          valB = valB.toLowerCase()
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [inventory, searchQuery, selectedCategory, sortConfig])

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const uniqueCategories = useMemo(() => {
    const cats = new Set(inventory.map(item => item.category))
    return ['Все', ...Array.from(cats)]
  }, [inventory])

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
              Нажмите на карточку статистики, чтобы открыть список (открывается только один за раз)
              {lastUpdate && <span className="last-update"> • Обновлено: {lastUpdate}</span>}
            </p>
          </div>

          <div className="stats-grid">
            <div className={`stat-card ${activeViews.inventory ? 'active' : ''}`} onClick={() => toggleView('inventory')}>
              <div className="stat-icon stat-icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Всего продуктов</p>
                <p className="stat-value">{inventory.length}</p>
              </div>
            </div>

            <div className={`stat-card ${activeViews.deliveries ? 'active' : ''}`} onClick={() => toggleView('deliveries')}>
              <div className="stat-icon stat-icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Требуют поставки</p>
                <p className="stat-value">{suggestedDeliveries.length}</p>
              </div>
            </div>

            <div className={`stat-card ${activeViews.expiring ? 'active' : ''}`} onClick={() => toggleView('expiring')}>
              <div className="stat-icon stat-icon-amber">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Истекают (1-7 дн.)</p>
                <p className="stat-value">{expiringSoon.length}</p>
              </div>
            </div>

            <div className={`stat-card ${activeViews.recipes ? 'active' : ''}`} onClick={() => toggleView('recipes')}>
              <div className="stat-icon stat-icon-purple">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Рецепты под угрозой</p>
                <p className="stat-value">{affectedRecipes.length}</p>
              </div>
            </div>
          </div>

          {activeCount > 0 ? (
            <div className="dynamic-lists-grid" style={{ gridTemplateColumns: `repeat(${activeCount}, minmax(0, 1fr))` }}>
              
              {/* 1. УМНАЯ ТАБЛИЦА ПРОДУКТОВ */}
              {activeViews.inventory && (
                <div className="card list-panel" style={{ gridColumn: '1 / -1' }}>
                  <div className="card-header">
                    <h2>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Все продукты
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="table-controls">
                      <div className="search-box-table">
                        <Search size={18} />
                        <input 
                          type="text" 
                          placeholder="Поиск по названию..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="table-search"
                        />
                      </div>
                      <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="table-filter"
                      >
                        {uniqueCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="table-container">
                      <table className="inventory-table">
                        <thead>
                          <tr>
                            <th onClick={() => handleSort('name')} className="sortable">
                              Название {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('category')} className="sortable">
                              Категория {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('quantity')} className="sortable text-right">
                              Остаток {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="text-right">Мин. норма</th>
                            <th onClick={() => handleSort('expirationDate')} className="sortable text-right">
                              Срок годности {sortConfig.key === 'expirationDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="text-center">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processedInventory.length > 0 ? (
                            processedInventory.map((item) => (
                              <tr key={item.id} className={`row-${item.status}`}>
                                <td>
                                  <div className="product-name">{item.name}</div>
                                  {item.hasExpired && <div className="expired-tag">⚠ Просрочено</div>}
                                </td>
                                <td>{item.category}</td>
                                <td className="text-right font-semibold">{item.quantity} {item.unit}</td>
                                <td className="text-right text-gray">{item.minQuantity} {item.unit}</td>
                                <td className="text-right">
                                  {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('ru-RU') : '—'}
                                </td>
                                <td className="text-center">
                                  {item.status === 'ok' && <span className="badge badge-ok">✓ Норма</span>}
                                  {item.status === 'low' && <span className="badge badge-low">⚠ Мало</span>}
                                  {item.status === 'critical' && <span className="badge badge-critical">✗ Критично</span>}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="empty-row">Продукты не найдены</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Требуется поставка */}
              {activeViews.deliveries && (
                <div className="card list-panel">
                  <div className="card-header card-header-red">
                    <h2><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Требуется поставка</h2>
                  </div>
                  <div className="card-body">
                    {suggestedDeliveries.length > 0 ? (
                      <div className="deliveries-list">
                        {suggestedDeliveries.map((delivery) => (
                          <div key={delivery.id} className={`delivery-item ${getPriorityColor(delivery.priority)}`}>
                            <div className="delivery-info">
                              <p className="delivery-product">{delivery.productName}</p>
                              <p className="delivery-quantity">Докупить: <strong>{delivery.suggestedQuantity} {delivery.unit}</strong></p>
                              <p className="delivery-context">(остаток: {delivery.currentQuantity} {delivery.unit}, мин: {delivery.minQuantity} {delivery.unit})</p>
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
                    ) : <div className="empty-state-small"><p>Все продукты в наличии</p></div>}
                  </div>
                </div>
              )}

              {/* 3. Истекают в течение 7 дней */}
              {activeViews.expiring && (
                <div className="card list-panel">
                  <div className="card-header card-header-amber">
                    <h2><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Истекают (1-7 дней)</h2>
                  </div>
                  <div className="card-body">
                    {expiringSoon.length > 0 ? (
                      <div className="expiring-list">
                        {expiringSoon.map((item) => (
                          <div key={item.id} className="expiring-item">
                            <div className="expiring-info">
                              <p className="expiring-name">{item.name}</p>
                              <p className="expiring-quantity">{item.quantity} {item.unit}</p>
                              <p className="expiring-date">Годен до: {new Date(item.expirationDate).toLocaleDateString('ru-RU')}</p>
                            </div>
                            <span className={`expiring-badge ${item.daysLeft <= 3 ? 'critical' : 'warning'}`}>{item.daysLeft} дн.</span>
                          </div>
                        ))}
                      </div>
                    ) : <div className="empty-state-small"><p>Нет продуктов с истекающим сроком</p></div>}
                  </div>
                </div>
              )}

              {/* 4. Просроченные партии */}
              {activeViews.expiring && expiredBatches.length > 0 && (
                <div className="card list-panel">
                  <div className="card-header" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', borderBottom: '2px solid #ef4444' }}>
                    <h2 style={{ color: '#dc2626' }}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>Просрочено ({expiredBatches.length})</h2>
                  </div>
                  <div className="card-body">
                    <div className="expiring-list">
                      {expiredBatches.map((item) => (
                        <div key={item.id} className="expiring-item" style={{ borderLeft: '4px solid #ef4444', background: '#fef2f2' }}>
                          <div className="expiring-info">
                            <p className="expiring-name" style={{ color: '#dc2626', fontWeight: 'bold' }}>{item.name}</p>
                            <p className="expiring-quantity">{item.quantity} {item.unit}</p>
                            <p className="expiring-date">Истек: {new Date(item.expirationDate).toLocaleDateString('ru-RU')}</p>
                          </div>
                          <span className="expiring-badge critical" style={{ background: '#ef4444', color: 'white' }}>{Math.abs(item.daysLeft)} дн. назад</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Рецепты под угрозой */}
              {activeViews.recipes && (
                <div className="card list-panel">
                  <div className="card-header card-header-purple">
                    <h2><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>Рецепты под угрозой</h2>
                  </div>
                  <div className="card-body">
                    {affectedRecipes.length > 0 ? (
                      <div className="recipes-list">
                        {affectedRecipes.map((recipe) => (
                          <div key={recipe.id} className="recipe-item">
                            <p className="recipe-name">{recipe.name}</p>
                            <div className="recipe-missing">
                              <span className="missing-label">Не хватает:</span>
                              {recipe.missingProducts.map((product, idx) => (
                                <span key={idx} className="missing-product">{product}{idx < recipe.missingProducts.length - 1 ? ', ' : ''}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="empty-state-small"><p>Нет рецептов под угрозой</p></div>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="all-closed-state">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
              <p>Нажмите на любую карточку статистики выше, чтобы просмотреть детали</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Monit