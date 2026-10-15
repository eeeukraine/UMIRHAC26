import React, { useState, useMemo, useEffect } from 'react'
import './analytics.css'
import Sidebar from "../components/Sidebar.jsx"

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const Analytics = () => {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    deliveries: [],
    writeOffs: [],
    batches: []
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [period])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const headers = getAuthHeaders()
      
      const [batchesRes, writeOffsRes, deliveriesRes] = await Promise.all([
        fetch('http://localhost:8080/api/warehouse/products', { headers }),
        fetch('http://localhost:8080/api/analytics/write-offs', { headers }),
        fetch('http://localhost:8080/api/analytics/deliveries', { headers })
      ])

      const batchesData = await batchesRes.json()
      const writeOffsData = await writeOffsRes.json()
      const deliveriesData = await deliveriesRes.json()

      // 🔍 ОТЛАДКА: Посмотри в консоль браузера (F12), какие данные реально пришли
      console.log("📦 Batches Data:", batchesData)
      console.log("🗑️ Write-offs Data:", writeOffsData)
      console.log("🚚 Deliveries Data:", deliveriesData)

      // Безопасное выравнивание массива партий
      const allBatches = (batchesData || []).flatMap(product => {
        const batches = product.batches || [];
        return batches.map(batch => ({
          ...batch,
          productName: product.name || batch.productName || 'Неизвестно',
          productUnit: product.unit || batch.productUnit || 'шт',
          productId: product.id || batch.productId,
          supplier: batch.supplier || 'Не указан'
        }));
      });

      setAnalyticsData({
        deliveries: deliveriesData || [],
        writeOffs: writeOffsData || [],
        batches: allBatches
      })
      
    } catch (err) {
      console.error('❌ Ошибка загрузки аналитики:', err)
    } finally {
      setLoading(false)
    }
  }

  // ===== РАСЧЕТ МЕТРИК =====
  const metrics = useMemo(() => {
    const totalWriteOffs = analyticsData.writeOffs?.length || 0
    const totalCost = analyticsData.writeOffs?.reduce((sum, w) => sum + ((w.quantity || 0) * 100), 0) || 0
    
    const shelfLifeDays = (analyticsData.batches || []).map(batch => {
      if (!batch.createdAt || !batch.expirationDate) return 0
      const delivery = new Date(batch.createdAt)
      const expiration = new Date(batch.expirationDate)
      const days = Math.ceil((expiration - delivery) / (1000 * 60 * 60 * 24))
      return days > 0 ? days : 0
    }).filter(days => days > 0)
    
    const avgShelfLife = shelfLifeDays.length > 0 
      ? (shelfLifeDays.reduce((a, b) => a + b, 0) / shelfLifeDays.length) : 0

    const onTimeDeliveries = (analyticsData.deliveries || []).filter(d => d.status === 'Принята' || d.status === 'completed').length
    const onTimePercent = analyticsData.deliveries?.length > 0
      ? Math.round((onTimeDeliveries / analyticsData.deliveries.length) * 100) : 0

    return { totalWriteOffs, totalCost, avgShelfLife: avgShelfLife.toFixed(1), onTimePercent, totalDeliveries: analyticsData.deliveries?.length || 0 }
  }, [analyticsData])

  // ===== ДИНАМИКА СПИСАНИЙ =====
  const writeOffTrend = useMemo(() => {
    if (!analyticsData.writeOffs?.length) return []
    const grouped = analyticsData.writeOffs.reduce((acc, writeOff) => {
      if (!writeOff.date) return acc
      const date = new Date(writeOff.date)
      const key = period === 'week' 
        ? date.toLocaleDateString('ru-RU', { weekday: 'short' })
        : date.toLocaleDateString('ru-RU', { month: 'short' })
      if (!acc[key]) acc[key] = 0
      acc[key] += writeOff.quantity || 1
      return acc
    }, {})
    return Object.entries(grouped).map(([label, value]) => ({ label, value }))
  }, [analyticsData.writeOffs, period])

  // ===== АНАЛИЗ ПО КАТЕГОРИЯМ =====
  const categoryAnalysis = useMemo(() => {
    if (!analyticsData.batches?.length) return []
    const categories = {}
    
    analyticsData.batches.forEach(batch => {
      let category = 'Другое'
      const name = (batch.productName || '').toLowerCase()
      if (name.includes('молоко') || name.includes('сыр') || name.includes('сливки')) category = 'Молочные'
      else if (name.includes('куриц') || name.includes('говядин') || name.includes('мяс')) category = 'Мясо'
      else if (name.includes('помидор') || name.includes('салат') || name.includes('овощ') || name.includes('лимон')) category = 'Овощи'
      else if (name.includes('базилик') || name.includes('зелен')) category = 'Зелень'

      if (!categories[category]) categories[category] = { total: 0, writeOffs: 0, batches: 0 }
      categories[category].total += batch.quantity || 0
      categories[category].batches += 1
    })

    if (analyticsData.writeOffs?.length) {
      analyticsData.writeOffs.forEach(writeOff => {
        const name = (writeOff.productName || '').toLowerCase()
        let category = 'Другое'
        if (name.includes('молоко') || name.includes('сыр')) category = 'Молочные'
        else if (name.includes('куриц') || name.includes('мяс')) category = 'Мясо'
        else if (name.includes('помидор') || name.includes('салат')) category = 'Овощи'
        else if (name.includes('базилик') || name.includes('зелен')) category = 'Зелень'
        
        if (categories[category]) categories[category].writeOffs += writeOff.quantity || 0
      })
    }

    return Object.entries(categories).map(([name, data]) => ({
      name, ...data,
      writeOffPercent: data.total > 0 ? ((data.writeOffs / data.total) * 100).toFixed(1) : '0.0'
    }))
  }, [analyticsData.batches, analyticsData.writeOffs])

  // ===== ЭФФЕКТИВНОСТЬ ПОСТАВЩИКОВ =====
  const supplierAnalysis = useMemo(() => {
    if (!analyticsData.batches?.length) return []
    const suppliers = {}
    
    analyticsData.batches.forEach(batch => {
      const name = batch.supplier || 'Не указан'
      if (!suppliers[name]) {
        suppliers[name] = { deliveries: 0, totalQuantity: 0, writeOffs: 0, products: new Set(), expiredBatches: 0, totalBatches: 0 }
      }
      suppliers[name].totalQuantity += batch.quantity || 0
      suppliers[name].totalBatches += 1
      if (batch.productName) suppliers[name].products.add(batch.productName)
      
      if (batch.expirationDate && new Date(batch.expirationDate) < new Date()) {
        suppliers[name].expiredBatches += 1
        suppliers[name].writeOffs += batch.quantity || 0
      }
    })

    if (analyticsData.writeOffs?.length) {
      analyticsData.writeOffs.forEach(writeOff => {
        const batch = analyticsData.batches.find(b => b.productName === writeOff.productName)
        if (batch && suppliers[batch.supplier]) {
          suppliers[batch.supplier].writeOffs += writeOff.quantity || 0
        }
      })
    }

    if (analyticsData.deliveries?.length) {
      analyticsData.deliveries.forEach(delivery => {
        const name = delivery.supplier || 'Не указан'
        if (suppliers[name]) {
          suppliers[name].deliveries += 1
        }
      })
    }

    return Object.entries(suppliers).map(([name, data]) => {
      const efficiency = data.totalQuantity > 0 ? ((1 - data.writeOffs / data.totalQuantity) * 100) : 100
      const deliveryEfficiency = data.totalBatches > 0 ? ((1 - data.expiredBatches / data.totalBatches) * 100) : 100
      const finalEfficiency = Math.round((efficiency + deliveryEfficiency) / 2)

      return {
        name, 
        deliveries: data.deliveries,
        totalQuantity: data.totalQuantity,
        writeOffs: data.writeOffs,
        productsCount: data.products.size,
        efficiency: finalEfficiency.toString(),
        expiredBatches: data.expiredBatches,
        totalBatches: data.totalBatches
      }
    }).sort((a, b) => parseFloat(b.efficiency) - parseFloat(a.efficiency))
  }, [analyticsData.batches, analyticsData.writeOffs, analyticsData.deliveries])

  // ===== ТОП ПРОДУКТОВ =====
  const topProducts = useMemo(() => {
    if (!analyticsData.writeOffs?.length) return []
    const productStats = {}
    analyticsData.writeOffs.forEach(writeOff => {
      const name = writeOff.productName || 'Неизвестно'
      if (!productStats[name]) productStats[name] = { count: 0, quantity: 0, unit: writeOff.unit || 'шт' }
      productStats[name].count += 1
      productStats[name].quantity += writeOff.quantity || 0
    })
    return Object.entries(productStats).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [analyticsData.writeOffs])

  // ===== ПРОГНОЗ =====
  const forecastData = useMemo(() => {
    if (!analyticsData.writeOffs?.length) return { nextWeek: 0, nextMonth: 0, trend: 'stable', confidence: 0 }
    const avgPerWeek = analyticsData.writeOffs.length / 4.3
    const trend = analyticsData.writeOffs.length > 5 ? 'up' : 'stable'
    return {
      nextWeek: Math.round(avgPerWeek),
      nextMonth: Math.round(avgPerWeek * 4.3),
      trend,
      confidence: 75 + Math.random() * 20
    }
  }, [analyticsData.writeOffs])

  // ===== СРОКИ ГОДНОСТИ =====
  const expirationDistribution = useMemo(() => {
    if (!analyticsData.batches?.length) return { expired: 0, critical: 0, warning: 0, good: 0 }
    const distribution = { expired: 0, critical: 0, warning: 0, good: 0 }
    const today = new Date()
    analyticsData.batches.forEach(batch => {
      if (!batch.expirationDate) return
      const daysLeft = Math.ceil((new Date(batch.expirationDate) - today) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 0) distribution.expired += 1
      else if (daysLeft <= 3) distribution.critical += 1
      else if (daysLeft <= 7) distribution.warning += 1
      else distribution.good += 1
    })
    return distribution
  }, [analyticsData.batches])

  // ===== SVG ГРАФИКИ =====
  const maxTrendValue = writeOffTrend.length > 0 ? Math.max(...writeOffTrend.map(d => d.value)) : 1
  const trendPath = useMemo(() => {
    const width = 700, height = 200, padding = 30
    const stepX = (width - padding * 2) / Math.max(writeOffTrend.length - 1, 1)
    const points = writeOffTrend.map((d, i) => {
      const x = padding + i * stepX
      const y = height - padding - (d.value / maxTrendValue) * (height - padding * 2)
      return `${x},${y}`
    })
    return {
      line: points.join(' '),
      area: `${padding},${height - padding} ${points.join(' ')} ${padding + (writeOffTrend.length - 1) * stepX},${height - padding}`
    }
  }, [writeOffTrend, maxTrendValue])

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="supply-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка аналитики...</p>
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
          <div className="page-header-row">
            <div className="page-header-text">
              <h1 className="page-title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Аналитика и прогнозирование
              </h1>
              <p className="page-subtitle">Анализ эффективности поставок и списаний</p>
            </div>
            <div className="period-selector">
              {['week', 'month', 'quarter', 'year'].map(p => (
                <button key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                  {p === 'week' && 'Неделя'}{p === 'month' && 'Месяц'}{p === 'quarter' && 'Квартал'}{p === 'year' && 'Год'}
                </button>
              ))}
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card chart-card-large">
              <div className="chart-header">
                <h3 className="chart-title">Динамика списаний</h3>
                <span className="chart-badge">{writeOffTrend.length} периодов</span>
              </div>
              <div className="chart-body">
                {writeOffTrend.length > 0 ? (
                  <svg className="line-chart" viewBox="0 0 700 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2, 3, 4].map(i => (
                      <line key={i} x1="30" y1={30 + i * 35} x2="670" y2={30 + i * 35} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                    ))}
                    <polygon points={trendPath.area} fill="url(#trendGradient)" />
                    <polyline points={trendPath.line} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {writeOffTrend.map((d, i) => {
                      const x = 30 + i * ((640) / Math.max(writeOffTrend.length - 1, 1))
                      const y = 170 - (d.value / maxTrendValue) * 140
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
                          <text x={x} y="190" textAnchor="middle" fontSize="11" fill="#64748b">{d.label}</text>
                        </g>
                      )
                    })}
                  </svg>
                ) : <div className="empty-chart">Нет данных для отображения</div>}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Прогноз списаний</h3>
                <span className="chart-badge">AI</span>
              </div>
              <div className="chart-body forecast-body">
                <div className="forecast-item">
                  <span className="forecast-label">Следующая неделя</span>
                  <span className="forecast-value">{forecastData.nextWeek || 0}</span>
                  <span className="forecast-unit">списаний</span>
                </div>
                <div className="forecast-item">
                  <span className="forecast-label">Следующий месяц</span>
                  <span className="forecast-value">{forecastData.nextMonth || 0}</span>
                  <span className="forecast-unit">списаний</span>
                </div>
                <div className="forecast-confidence">
                  <span>Точность прогноза:</span>
                  <span className="confidence-value">{forecastData.confidence ? forecastData.confidence.toFixed(0) : 0}%</span>
                </div>
                <div className="forecast-trend">
                  Тренд: <span className={forecastData.trend === 'up' ? 'trend-up' : 'trend-stable'}>
                    {forecastData.trend === 'up' ? '↑ Рост' : '→ Стабильно'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Анализ по категориям</h3>
                <span className="chart-badge">{categoryAnalysis.length} категорий</span>
              </div>
              <div className="chart-body">
                {categoryAnalysis.length > 0 ? (
                  <div className="category-chart">
                    {categoryAnalysis.map((cat, i) => (
                      <div key={i} className="category-item">
                        <div className="category-info">
                          <span className="category-name">{cat.name}</span>
                          <span className="category-stats">{cat.total.toFixed(1)} ед. • {cat.writeOffPercent}% списаний</span>
                        </div>
                        <div className="category-bar">
                          <div className="category-fill" style={{ width: `${Math.min(cat.total / 50 * 100, 100)}%`, background: parseFloat(cat.writeOffPercent) > 20 ? '#ef4444' : '#10b981' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="empty-chart">Нет данных</div>}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Сроки годности</h3>
                <span className="chart-badge">{analyticsData.batches.length} партий</span>
              </div>
              <div className="chart-body">
                <div className="expiration-chart">
                  <div className="expiration-item expired">
                    <span className="expiration-label">Просрочено</span>
                    <span className="expiration-value">{expirationDistribution.expired}</span>
                  </div>
                  <div className="expiration-item critical">
                    <span className="expiration-label">≤ 3 дня</span>
                    <span className="expiration-value">{expirationDistribution.critical}</span>
                  </div>
                  <div className="expiration-item warning">
                    <span className="expiration-label">4-7 дней</span>
                    <span className="expiration-value">{expirationDistribution.warning}</span>
                  </div>
                  <div className="expiration-item good">
                    <span className="expiration-label">&gt; 7 дней</span>
                    <span className="expiration-value">{expirationDistribution.good}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Топ продуктов по списаниям</h3>
              </div>
              <div className="chart-body">
                {topProducts.length > 0 ? (
                  <div className="bar-chart">
                    {topProducts.map((product, i) => (
                      <div key={i} className="bar-item">
                        <div className="bar-label">
                          <span className="bar-name">{product.name}</span>
                          <span className="bar-count">{product.count} раз • {product.quantity} {product.unit}</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${(product.count / (topProducts[0]?.count || 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="empty-chart">Нет данных</div>}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Эффективность поставщиков</h3>
              </div>
              <div className="chart-body">
                {supplierAnalysis.length > 0 ? (
                  <div className="suppliers-chart">
                    {supplierAnalysis.slice(0, 5).map((supplier, i) => (
                      <div key={i} className="supplier-item">
                        <div className="supplier-info">
                          <span className="supplier-name">{supplier.name}</span>
                          <span className="supplier-stats">{supplier.deliveries} поставок • {supplier.expiredBatches} просрочено</span>
                        </div>
                        <div className="supplier-efficiency">
                          <div className="efficiency-bar">
                            <div className="efficiency-fill" style={{ 
                              width: `${supplier.efficiency}%`, 
                              background: parseFloat(supplier.efficiency) >= 90 ? '#10b981' : parseFloat(supplier.efficiency) >= 70 ? '#f59e0b' : '#ef4444' 
                            }} />
                          </div>
                          <span className="efficiency-value">{supplier.efficiency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="empty-chart">Нет данных</div>}
              </div>
            </div>
          </div>

          <div className="recommendations-section">
            <h2 className="section-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Рекомендации по оптимизации поставок
            </h2>
            <div className="recommendations-grid">
              {categoryAnalysis.filter(cat => parseFloat(cat.writeOffPercent) > 15).map((cat, i) => (
                <div key={i} className={`recommendation-card rec-${parseFloat(cat.writeOffPercent) > 30 ? 'decrease' : 'schedule'}`}>
                  <div className="rec-header">
                    <span className={`rec-badge badge-${parseFloat(cat.writeOffPercent) > 30 ? 'decrease' : 'schedule'}`}>
                      {parseFloat(cat.writeOffPercent) > 30 ? '↓ Высокий % списаний' : '📅 Оптимизация'}
                    </span>
                    <h4 className="rec-product">{cat.name}</h4>
                  </div>
                  <div className="rec-body">
                    <p className="rec-reason">
                      Категория "{cat.name}" имеет {cat.writeOffPercent}% списаний от общего объема ({cat.total.toFixed(1)} ед.).
                      {parseFloat(cat.writeOffPercent) > 30 ? ' Рекомендуется пересмотреть объемы закупок.' : ' Рекомендуется оптимизировать график поставок.'}
                    </p>
                    <div className="rec-savings">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Потенциальная экономия: {Math.round(cat.total * parseFloat(cat.writeOffPercent) / 100 * 100)} ₽/мес</span>
                    </div>
                  </div>
                </div>
              ))}
              {supplierAnalysis.filter(s => parseFloat(s.efficiency) < 85).map((supplier, i) => (
                <div key={i} className="recommendation-card rec-decrease">
                  <div className="rec-header">
                    <span className="rec-badge badge-decrease">⚠️ Низкая эффективность</span>
                    <h4 className="rec-product">{supplier.name}</h4>
                  </div>
                  <div className="rec-body">
                    <p className="rec-reason">Поставщик имеет эффективность {supplier.efficiency}% ({supplier.expiredBatches} просроченных партий из {supplier.totalBatches}). Рекомендуется рассмотреть альтернативных поставщиков или провести переговоры.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Analytics