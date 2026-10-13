import React, { useState, useMemo } from 'react'
import './spisaniya.css'
import Sidebar from "../components/Sidebar.jsx"

const Spisaniya = () => {
  const [filter, setFilter] = useState('all') // all, auto, manual, expired
  const [searchQuery, setSearchQuery] = useState('')

  // Демо-данные: продукты с разными партиями (разные сроки годности)
  const productsData = [
    {
      id: 1,
      name: 'Помидоры',
      unit: 'кг',
      batches: [
        { id: 101, quantity: 10, expirationDate: '2026-02-15', supplier: 'Овощи+', deliveryDate: '2026-01-10' },
        { id: 102, quantity: 2, expirationDate: '2026-02-17', supplier: 'Овощи+', deliveryDate: '2026-01-12' },
        { id: 103, quantity: 5, expirationDate: '2026-02-20', supplier: 'Фермерское хозяйство', deliveryDate: '2026-01-15' }
      ]
    },
    {
      id: 2,
      name: 'Молоко 3.2%',
      unit: 'л',
      batches: [
        { id: 201, quantity: 15, expirationDate: '2026-02-12', supplier: 'Молочный мир', deliveryDate: '2026-01-08' },
        { id: 202, quantity: 8, expirationDate: '2026-02-18', supplier: 'Молочный мир', deliveryDate: '2026-01-14' }
      ]
    },
    {
      id: 3,
      name: 'Куриное филе',
      unit: 'кг',
      batches: [
        { id: 301, quantity: 12, expirationDate: '2026-02-14', supplier: 'Мясной двор', deliveryDate: '2026-01-09' },
        { id: 302, quantity: 6, expirationDate: '2026-02-16', supplier: 'Мясной двор', deliveryDate: '2026-01-11' },
        { id: 303, quantity: 4, expirationDate: '2026-02-19', supplier: 'Фермерское хозяйство', deliveryDate: '2026-01-16' }
      ]
    },
    {
      id: 4,
      name: 'Сыр Моцарелла',
      unit: 'кг',
      batches: [
        { id: 401, quantity: 8, expirationDate: '2026-02-25', supplier: 'ФудСервис', deliveryDate: '2026-01-15' },
        { id: 402, quantity: 3, expirationDate: '2026-03-01', supplier: 'ФудСервис', deliveryDate: '2026-01-20' }
      ]
    },
    {
      id: 5,
      name: 'Базилик свежий',
      unit: 'кг',
      batches: [
        { id: 501, quantity: 2, expirationDate: '2026-02-10', supplier: 'Овощи+', deliveryDate: '2026-01-05' },
        { id: 502, quantity: 1.5, expirationDate: '2026-02-13', supplier: 'Фермерское хозяйство', deliveryDate: '2026-01-08' }
      ]
    }
  ]

  // История списаний
  const writeOffHistory = [
    {
      id: 1,
      type: 'auto',
      productName: 'Базилик свежий',
      batchId: 501,
      quantity: 0.5,
      unit: 'кг',
      reason: 'Истек срок годности',
      date: '2026-02-10 09:15',
      status: 'completed'
    },
    {
      id: 2,
      type: 'manual',
      productName: 'Помидоры',
      batchId: 101,
      quantity: 3,
      unit: 'кг',
      reason: 'Списание для блюда: Паста Карбонара',
      date: '2026-02-10 14:30',
      status: 'completed'
    },
    {
      id: 3,
      type: 'auto',
      productName: 'Молоко 3.2%',
      batchId: 201,
      quantity: 2,
      unit: 'л',
      reason: 'Истек срок годности',
      date: '2026-02-12 08:00',
      status: 'pending'
    },
    {
      id: 4,
      type: 'manual',
      productName: 'Куриное филе',
      batchId: 301,
      quantity: 5,
      unit: 'кг',
      reason: 'Списание для блюда: Цезарь с курицей',
      date: '2026-02-10 15:45',
      status: 'completed'
    }
  ]

  // Получаем все партии с информацией о продукте
  const allBatches = useMemo(() => {
    return productsData.flatMap(product => 
      product.batches.map(batch => ({
        ...batch,
        productName: product.name,
        productUnit: product.unit,
        productId: product.id
      }))
    ).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)) // Сортировка по сроку годности
  }, [productsData])

  // Фильтрация истории списаний
  const filteredHistory = useMemo(() => {
    let result = writeOffHistory

    if (filter !== 'all') {
      result = result.filter(item => item.type === filter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.productName.toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query)
      )
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [filter, searchQuery])

  // Статистика
  const stats = useMemo(() => {
    const today = new Date()
    const expiredBatches = allBatches.filter(b => new Date(b.expirationDate) < today)
    const expiringSoon = allBatches.filter(b => {
      const expDate = new Date(b.expirationDate)
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
      return diffDays <= 3 && diffDays >= 0
    })

    return {
      totalBatches: allBatches.length,
      expiredCount: expiredBatches.length,
      expiringSoonCount: expiringSoon.length,
      totalWriteOffs: writeOffHistory.length,
      autoWriteOffs: writeOffHistory.filter(w => w.type === 'auto').length,
      manualWriteOffs: writeOffHistory.filter(w => w.type === 'manual').length
    }
  }, [allBatches, writeOffHistory])

  // Функция для получения дней до истечения срока
  const getDaysUntilExpiration = (expirationDate) => {
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Функция для получения статуса срока годности
  const getExpirationStatus = (expirationDate) => {
    const days = getDaysUntilExpiration(expirationDate)
    if (days < 0) return { label: 'Просрочено', class: 'expired', color: '#ef4444' }
    if (days <= 3) return { label: `${days} дн.`, class: 'critical', color: '#f59e0b' }
    if (days <= 7) return { label: `${days} дн.`, class: 'warning', color: '#3b82f6' }
    return { label: `${days} дн.`, class: 'ok', color: '#10b981' }
  }

  return (
    <div className="page-layout">
      <Sidebar />
      
      <main className="supply-content">
        <div className="page-wrapper">
          
          {/* Заголовок */}
          <div className="page-header">
            <h1 className="page-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Списания и партии
            </h1>
            <p className="page-subtitle">
              Управление партиями продуктов с разными сроками годности. Автоматическое списание по FIFO и сроку годности.
            </p>
          </div>

          {/* Статистика */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Всего партий</p>
                <p className="stat-value">{stats.totalBatches}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Просрочено</p>
                <p className="stat-value">{stats.expiredCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-amber">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Истекает скоро</p>
                <p className="stat-value">{stats.expiringSoonCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Всего списаний</p>
                <p className="stat-value">{stats.totalWriteOffs}</p>
                <p className="stat-subtext">
                  <span className="text-auto">{stats.autoWriteOffs} авто</span>
                  <span className="text-separator">•</span>
                  <span className="text-manual">{stats.manualWriteOffs} ручных</span>
                </p>
              </div>
            </div>
          </div>

          {/* Партии продуктов */}
          <div className="section">
            <h2 className="section-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Партии продуктов (FIFO)
            </h2>
            <p className="section-description">
              При заказе блюд сначала списываются продукты с более ранним сроком годности
            </p>

            <div className="products-list">
              {productsData.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <span className="product-total">
                      Всего: {product.batches.reduce((sum, b) => sum + b.quantity, 0)} {product.unit}
                    </span>
                  </div>
                  
                  <div className="batches-list">
                    {product.batches.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)).map((batch, idx) => {
                      const status = getExpirationStatus(batch.expirationDate)
                      return (
                        <div key={batch.id} className={`batch-item ${idx === 0 ? 'fifo-first' : ''}`}>
                          {idx === 0 && <span className="fifo-badge">FIFO</span>}
                          <div className="batch-info">
                            <div className="batch-quantity">
                              <span className="quantity-value">{batch.quantity}</span>
                              <span className="quantity-unit">{product.unit}</span>
                            </div>
                            <div className="batch-details">
                              <span className="batch-supplier">{batch.supplier}</span>
                              <span className="batch-date">Поставка: {new Date(batch.deliveryDate).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                          <div className={`batch-expiration ${status.class}`}>
                            <span className="expiration-label">Годен до:</span>
                            <span className="expiration-date">{new Date(batch.expirationDate).toLocaleDateString('ru-RU')}</span>
                            <span className="expiration-days" style={{ color: status.color }}>{status.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* История списаний */}
          <div className="section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  История списаний
                </h2>
              </div>
              
              <div className="filter-controls">
                <div className="search-box">
                  <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Поиск..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-tabs">
                  <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    Все
                  </button>
                  <button 
                    className={`filter-btn ${filter === 'auto' ? 'active' : ''}`}
                    onClick={() => setFilter('auto')}
                  >
                    Автоматические
                  </button>
                  <button 
                    className={`filter-btn ${filter === 'manual' ? 'active' : ''}`}
                    onClick={() => setFilter('manual')}
                  >
                    Ручные
                  </button>
                </div>
              </div>
            </div>

            <div className="writeoff-list">
              {filteredHistory.length > 0 ? (
                filteredHistory.map(item => (
                  <div key={item.id} className={`writeoff-item type-${item.type}`}>
                    <div className="writeoff-icon">
                      {item.type === 'auto' ? (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ) : (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="writeoff-content">
                      <div className="writeoff-header">
                        <h4 className="writeoff-product">{item.productName}</h4>
                        <span className={`writeoff-type-badge type-${item.type}`}>
                          {item.type === 'auto' ? 'Авто' : 'Ручное'}
                        </span>
                      </div>
                      <p className="writeoff-reason">{item.reason}</p>
                      <div className="writeoff-meta">
                        <span className="writeoff-date">{item.date}</span>
                        <span className={`writeoff-status status-${item.status}`}>
                          {item.status === 'completed' ? '✓ Выполнено' : '⏳ Ожидает'}
                        </span>
                      </div>
                    </div>

                    <div className="writeoff-quantity">
                      <span className="qty-value">-{item.quantity}</span>
                      <span className="qty-unit">{item.unit}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>История списаний пуста</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Spisaniya