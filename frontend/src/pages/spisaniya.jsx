import React, { useState, useMemo, useEffect } from 'react'
import './spisaniya.css'
import Sidebar from "../components/Sidebar.jsx"

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const getLocalTodayStr = () => {
  return new Date().toLocaleDateString('sv-SE');
};

const isExpired = (dateStr) => {
  if (!dateStr) return false;
  const cleanDate = String(dateStr).substring(0, 10);
  const today = getLocalTodayStr();
  return cleanDate <= today;
};

const Spisaniya = () => {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCard, setExpandedCard] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [productsData, setProductsData] = useState([])
  const [writeOffHistory, setWriteOffHistory] = useState([])
  const [allBatches, setAllBatches] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const headers = getAuthHeaders()
      
      const productsRes = await fetch('http://localhost:8080/api/warehouse/products', { headers })
      const products = await productsRes.json()
      
      const formattedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        unit: product.unit,
        batches: product.batches.map(batch => ({
          id: batch.id,
          quantity: batch.quantity,
          expirationDate: batch.expirationDate,
          supplier: batch.supplier || 'Не указан',
          deliveryDate: batch.createdAt ? new Date(batch.createdAt).toISOString().split('T')[0] : 'Не указана',
          batchNumber: batch.batchNumber
        }))
      }))
      
      const allBatchesFlat = formattedProducts.flatMap(product => 
        product.batches.map(batch => ({
          ...batch,
          productName: product.name,
          productUnit: product.unit,
          productId: product.id
        }))
      )
      
      // ✅ ЗАГРУЖАЕМ ТОЛЬКО РЕАЛЬНУЮ ИСТОРИЮ (без авто-генерации просрочки)
      // Если есть эндпоинт, раскомментируй:
      // const historyRes = await fetch('http://localhost:8080/api/writeoffs', { headers })
      // const history = await historyRes.json()
      const history = [] // Пока пустой массив для демо
      
      setProductsData(formattedProducts)
      setAllBatches(allBatchesFlat.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)))
      setWriteOffHistory(history)
      
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ НОВАЯ ФУНКЦИЯ: Ручное подтверждение списания просроченной партии
  const handleWriteOffBatch = async (batch) => {
    if (!window.confirm(`Вы уверены, что хотите списать партию "${batch.productName}" (${batch.quantity} ${batch.productUnit})?\nПричина: Истек срок годности`)) {
      return;
    }

    try {
      // ✅ ЗДЕСЬ ДОЛЖЕН БЫТЬ РЕАЛЬНЫЙ ЗАПРОС НА БЭКЕНД:
      /*
      const response = await fetch('http://localhost:8080/api/writeoffs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          batchId: batch.id,
          quantity: batch.quantity,
          reason: 'Истек срок годности (подтверждено оператором)'
        })
      });
      if (!response.ok) throw new Error('Ошибка сервера');
      */

      // Локальное обновление UI для мгновенного отклика
      const newWriteOff = {
        id: Date.now(),
        type: 'auto-confirmed', // Специальный тип: авто-обнаружено, но подтверждено вручную
        productName: batch.productName,
        batchId: batch.id,
        quantity: batch.quantity,
        unit: batch.productUnit,
        reason: 'Истек срок годности (подтверждено)',
        date: new Date().toLocaleString('ru-RU'),
        status: 'completed'
      }
      
      setWriteOffHistory(prev => [newWriteOff, ...prev])
      
      // Удаляем партию из активных списков
      setAllBatches(prev => prev.filter(b => b.id !== batch.id))
      setProductsData(prev => prev.map(p => ({
        ...p,
        batches: p.batches.filter(b => b.id !== batch.id)
      })))
      
    } catch (err) {
      console.error('Ошибка при списании:', err)
      alert('Не удалось выполнить списание. Проверьте подключение.')
    }
  }

  const toggleCard = (cardName) => {
    setExpandedCard(expandedCard === cardName ? null : cardName)
  }

  const filteredHistory = useMemo(() => {
    let result = writeOffHistory
    if (filter !== 'all') result = result.filter(item => item.type === filter || (filter === 'auto' && item.type === 'auto-confirmed'))
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.productName.toLowerCase().includes(query) || item.reason.toLowerCase().includes(query)
      )
    }
    return result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [filter, searchQuery, writeOffHistory])

  const stats = useMemo(() => {
    const expiredBatches = allBatches.filter(b => isExpired(b.expirationDate))
    
    const expiringSoon = allBatches.filter(b => {
      const expDate = new Date(b.expirationDate);
      const today = new Date();
      expDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays > 0;
    });

    return {
      totalBatches: allBatches.length,
      expiredCount: expiredBatches.length,
      expiringSoonCount: expiringSoon.length,
      totalWriteOffs: writeOffHistory.length,
      // Считаем и 'auto', и 'auto-confirmed' как автоматические по происхождению
      autoWriteOffs: writeOffHistory.filter(w => w.type === 'auto' || w.type === 'auto-confirmed').length,
      manualWriteOffs: writeOffHistory.filter(w => w.type === 'manual').length
    }
  }, [allBatches, writeOffHistory])

  const getDaysUntilExpiration = (expirationDate) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    expDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = expDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const getExpirationStatus = (expirationDate) => {
    const days = getDaysUntilExpiration(expirationDate)
    if (days <= 0) return { label: 'Просрочено', class: 'expired', color: '#ef4444' }
    if (days <= 3) return { label: `${days} дн.`, class: 'critical', color: '#f59e0b' }
    if (days <= 7) return { label: `${days} дн.`, class: 'warning', color: '#3b82f6' }
    return { label: `${days} дн.`, class: 'ok', color: '#10b981' }
  }

  const renderDropdownContent = () => {
    if (!expandedCard) return null;

    if (['batches', 'expired', 'expiring'].includes(expandedCard)) {
      let filteredBatches = allBatches;
      
      if (expandedCard === 'expired') {
        filteredBatches = allBatches.filter(b => isExpired(b.expirationDate));
      } else if (expandedCard === 'expiring') {
        filteredBatches = allBatches.filter(b => {
          const days = getDaysUntilExpiration(b.expirationDate);
          return days > 0 && days <= 3;
        });
      }

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
                const isExpiredBatch = isExpired(batch.expirationDate);
                
                return (
                  <div key={batch.id} className={`batch-item ${isExpiredBatch ? 'batch-item-expired-action' : (idx === 0 && expandedCard === 'batches' ? 'fifo-first' : '')}`}>
                    {idx === 0 && expandedCard === 'batches' && !isExpiredBatch && <span className="fifo-badge">FIFO</span>}
                    {isExpiredBatch && <span className="fifo-badge expired-badge">ПРОСРОЧЕНО</span>}
                    
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

                    {/* ✅ КНОПКА СПИСАНИЯ ТОЛЬКО ДЛЯ ПРОСРОЧЕННЫХ */}
                    {isExpiredBatch && (
                      <button 
                        className="btn-write-off"
                        onClick={() => handleWriteOffBatch(batch)}
                        title="Подтвердить списание"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Списать</span>
                      </button>
                    )}
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
                  {item.type === 'auto' || item.type === 'auto-confirmed' ? (
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
                      {item.type === 'auto-confirmed' ? 'Подтверждено' : item.type === 'auto' ? 'Авто' : 'Ручное'}
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
      case 'expired': return '⚠️ Просроченные партии (Требуют подтверждения списания)';
      case 'expiring': return '⏳ Истекающие партии (≤ 3 дней)';
      case 'writeoffs': return '📝 Полная история списаний';
      default: return '';
    }
  }

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="supply-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка данных...</p>
          </div>
        </main>
      </div>
    );
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
              Нажмите на карточку ниже, чтобы просмотреть детальную информацию и подтвердить списания.
            </p>
          </div>

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
                  <span className="text-auto">{stats.autoWriteOffs} по сроку</span>
                  <span className="text-separator">•</span>
                  <span className="text-manual">{stats.manualWriteOffs} ручных</span>
                </p>
              </div>
              <div className="expand-icon">▼</div>
            </div>
          </div>

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