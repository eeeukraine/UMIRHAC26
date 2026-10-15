import React, { useState, useMemo } from 'react'
import './spisaniya.css'
import Sidebar from "../components/Sidebar.jsx"

const Spisaniya = () => {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCard, setExpandedCard] = useState(null)

  const toggleCard = (cardName) => {
    setExpandedCard(expandedCard === cardName ? null : cardName)
  }

  // Демо-данные
  const productsData = [
    {
      id: 1, name: 'Помидоры', unit: 'кг',
      batches: [
        { id: 101, quantity: 10, expirationDate: '2026-02-15', supplier: 'Овощи+', deliveryDate: '2026-01-10' },
        { id: 102, quantity: 2, expirationDate: '2026-02-17', supplier: 'Овощи+', deliveryDate: '2026-01-12' },
        { id: 103, quantity: 5, expirationDate: '2026-02-20', supplier: 'Фермерское хозяйство', deliveryDate: '2026-01-15' }
      ]
    },
    {
      id: 2, name: 'Молоко 3.2%', unit: 'л',
      batches: [
        { id: 201, quantity: 15, expirationDate: '2026-02-12', supplier: 'Молочный мир', deliveryDate: '2026-01-08' },
        { id: 202, quantity: 8, expirationDate: '2026-02-18', supplier: 'Молочный мир', deliveryDate: '2026-01-14' }
      ]
    },
    {
      id: 3, name: 'Куриное филе', unit: 'кг',
      batches: [
        { id: 301, quantity: 12, expirationDate: '2026-02-14', supplier: 'Мясной двор', deliveryDate: '2026-01-09' },
        { id: 302, quantity: 6, expirationDate: '2026-02-16', supplier: 'Мясной двор', deliveryDate: '2026-01-11' },
        { id: 303, quantity: 4, expirationDate: '2026-02-19', supplier: 'Фермерское хозяйство', deliveryDate: '2026-01-16' }
      ]
    },
    {
      id: 4, name: 'Сыр Моцарелла', unit: 'кг',
      batches: [
        { id: 401, quantity: 8, expirationDate: '2026-02-25', supplier: 'ФудСервис', deliveryDate: '2026-01-15' },
        { id: 402, quantity: 3, expirationDate: '2026-03-01', supplier: 'ФудСервис', deliveryDate: '2026-01-20' }
      ]
    },
    {
      id: 5, name: 'Базилик свежий', unit: 'кг',
      batches: [
        { id: 501, quantity: 2, expirationDate: '2026-02-10', supplier: 'Овощи+', deliveryDate: '2026-01-05' },
        { id: 502, quantity: 1.5, expirationDate: '2026-02-13', supplier: 'Фермерское хозяйство', deliveryDate: '2026-01-08' }
      ]
    }
  ]

  const writeOffHistory = [
    { id: 1, type: 'auto', productName: 'Базилик свежий', batchId: 501, quantity: 0.5, unit: 'кг', reason: 'Истек срок годности', date: '2026-02-10 09:15', status: 'completed' },
    { id: 2, type: 'manual', productName: 'Помидоры', batchId: 101, quantity: 3, unit: 'кг', reason: 'Списание для блюда: Паста Карбонара', date: '2026-02-10 14:30', status: 'completed' },
    { id: 3, type: 'auto', productName: 'Молоко 3.2%', batchId: 201, quantity: 2, unit: 'л', reason: 'Истек срок годности', date: '2026-02-12 08:00', status: 'pending' },
    { id: 4, type: 'manual', productName: 'Куриное филе', batchId: 301, quantity: 5, unit: 'кг', reason: 'Списание для блюда: Цезарь с курицей', date: '2026-02-10 15:45', status: 'completed' }
  ]

  const allBatches = useMemo(() => {
    return productsData.flatMap(product => 
      product.batches.map(batch => ({
        ...batch,
        productName: product.name,
        productUnit: product.unit,
        productId: product.id
      }))
    ).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate))
  }, [productsData])

  const filteredHistory = useMemo(() => {
    let result = writeOffHistory
    if (filter !== 'all') result = result.filter(item => item.type === filter)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.productName.toLowerCase().includes(query) || item.reason.toLowerCase().includes(query)
      )
    }
    return result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [filter, searchQuery])

  const stats = useMemo(() => {
    const today = new Date()
    const expiredBatches = allBatches.filter(b => new Date(b.expirationDate) < today)
    const expiringSoon = allBatches.filter(b => {
      const diffDays = Math.ceil((new Date(b.expirationDate) - today) / (1000 * 60 * 60 * 24))
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

  const getDaysUntilExpiration = (expirationDate) => {
    const diffTime = new Date(expirationDate) - new Date()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getExpirationStatus = (expirationDate) => {
    const days = getDaysUntilExpiration(expirationDate)
    if (days < 0) return { label: 'Просрочено', class: 'expired', color: '#ef4444' }
    if (days <= 3) return { label: `${days} дн.`, class: 'critical', color: '#f59e0b' }
    if (days <= 7) return { label: `${days} дн.`, class: 'warning', color: '#3b82f6' }
    return { label: `${days} дн.`, class: 'ok', color: '#10b981' }
  }

  // Рендер содержимого выпадающей панели (теперь с полным UI)
  const renderDropdownContent = () => {
    if (!expandedCard) return null;

    // 1. Отображение партий (Все, Просроченные или Истекающие)
    if (['batches', 'expired', 'expiring'].includes(expandedCard)) {
      let filteredBatches = allBatches;
      if (expandedCard === 'expired') {
        filteredBatches = allBatches.filter(b => new Date(b.expirationDate) < new Date());
      } else if (expandedCard === 'expiring') {
        filteredBatches = allBatches.filter(b => {
          const days = getDaysUntilExpiration(b.expirationDate);
          return days >= 0 && days <= 3;
        });
      }

      // Группируем по продуктам для красивого отображения
      const groupedProducts = productsData.map(product => {
        const productBatches = filteredBatches.filter(b => b.productId === product.id);
        if (productBatches.length === 0) return null;

        return (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <h3 className="product-name">{product.name}</h3>
              <span className="product-total">
                В наличии: {productBatches.reduce((sum, b) => sum + b.quantity, 0)} {product.unit}
              </span>
            </div>
            <div className="batches-list">
              {productBatches.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)).map((batch, idx) => {
                const status = getExpirationStatus(batch.expirationDate);
                return (
                  <div key={batch.id} className={`batch-item ${idx === 0 && expandedCard === 'batches' ? 'fifo-first' : ''}`}>
                    {idx === 0 && expandedCard === 'batches' && <span className="fifo-badge">FIFO</span>}
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
        );
      }).filter(Boolean);

      return (
        <div className="rich-dropdown-content">
          <div className="products-list">
            {groupedProducts.length > 0 ? groupedProducts : (
              <div className="empty-state">
                <p>Нет данных для отображения</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. Отображение истории списаний
    if (expandedCard === 'writeoffs') {
      return (
        <div className="rich-dropdown-content">
          <div className="filter-controls" style={{ marginBottom: '1.5rem' }}>
            <div className="search-box">
              <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Поиск по продукту или причине..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-tabs">
              <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
              <button className={`filter-btn ${filter === 'auto' ? 'active' : ''}`} onClick={() => setFilter('auto')}>Автоматические</button>
              <button className={`filter-btn ${filter === 'manual' ? 'active' : ''}`} onClick={() => setFilter('manual')}>Ручные</button>
            </div>
          </div>

          <div className="writeoff-list">
            {filteredHistory.length > 0 ? filteredHistory.map(item => (
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
            )) : (
              <div className="empty-state">
                <p>История списаний пуста</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  const getPanelTitle = () => {
    switch(expandedCard) {
      case 'batches': return '📦 Все партии продуктов';
      case 'expired': return '⚠️ Просроченные партии (Требуют внимания)';
      case 'expiring': return '⏳ Истекающие партии (≤ 3 дней)';
      case 'writeoffs': return '📝 Полная история списаний';
      default: return '';
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Списания и партии
            </h1>
            <p className="page-subtitle">
              Нажмите на карточку ниже, чтобы просмотреть детальную информацию.
            </p>
          </div>

          {/* Сетка статистики (теперь это главные кнопки навигации) */}
          <div className="stats-grid">
            <div className={`stat-card ${expandedCard === 'batches' ? 'active' : ''}`} onClick={() => toggleCard('batches')}>
              <div className="stat-icon stat-icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Всего партий</p>
                <p className="stat-value">{stats.totalBatches}</p>
              </div>
              <div className="expand-icon">▼</div>
            </div>

            <div className={`stat-card ${expandedCard === 'expired' ? 'active' : ''}`} onClick={() => toggleCard('expired')}>
              <div className="stat-icon stat-icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Просрочено</p>
                <p className="stat-value">{stats.expiredCount}</p>
              </div>
              <div className="expand-icon">▼</div>
            </div>

            <div className={`stat-card ${expandedCard === 'expiring' ? 'active' : ''}`} onClick={() => toggleCard('expiring')}>
              <div className="stat-icon stat-icon-amber">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Истекает скоро</p>
                <p className="stat-value">{stats.expiringSoonCount}</p>
              </div>
              <div className="expand-icon">▼</div>
            </div>

            <div className={`stat-card ${expandedCard === 'writeoffs' ? 'active' : ''}`} onClick={() => toggleCard('writeoffs')}>
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
              <div className="expand-icon">▼</div>
            </div>
          </div>

          {/* Единая презентабельная выпадающая панель для ВСЕХ деталей */}
          {expandedCard && (
            <div className="dropdown-panel">
              <div className="dropdown-header">
                <h3 className="dropdown-title">{getPanelTitle()}</h3>
                <button className="close-btn" onClick={() => setExpandedCard(null)} title="Закрыть">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="dropdown-content">
                {renderDropdownContent()}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default Spisaniya