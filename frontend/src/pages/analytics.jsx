import React, { useState, useMemo } from 'react'
import './analytics.css'
import Sidebar from "../components/Sidebar.jsx"

const Analytics = () => {
  const [period, setPeriod] = useState('month') // week, month, quarter, year

  // ===== РЕАЛЬНЫЕ ДЕМО-ДАННЫЕ =====
  
  // Динамика списаний по дням/месяцам
  const writeOffTrend = period === 'week' 
    ? [
        { label: 'Пн', value: 12 }, { label: 'Вт', value: 8 }, { label: 'Ср', value: 15 },
        { label: 'Чт', value: 10 }, { label: 'Пт', value: 22 }, { label: 'Сб', value: 28 }, { label: 'Вс', value: 18 }
      ]
    : [
        { label: 'Янв', value: 145 }, { label: 'Фев', value: 132 }, { label: 'Мар', value: 168 },
        { label: 'Апр', value: 154 }, { label: 'Май', value: 189 }, { label: 'Июн', value: 201 },
        { label: 'Июл', value: 178 }, { label: 'Авг', value: 165 }, { label: 'Сен', value: 142 },
        { label: 'Окт', value: 158 }, { label: 'Ноя', value: 173 }, { label: 'Дек', value: 195 }
      ]

  // Причины списаний
  const writeOffReasons = [
    { label: 'Истек срок годности', value: 42, color: '#ef4444' },
    { label: 'Закончился на складе', value: 35, color: '#f59e0b' },
    { label: 'Брак / повреждение', value: 15, color: '#8b5cf6' },
    { label: 'Пересорт', value: 8, color: '#3b82f6' }
  ]

  // Топ продуктов по частоте списаний
  const topProducts = [
    { name: 'Молоко 3.2%', count: 48, unit: 'л', trend: 'up' },
    { name: 'Куриное филе', count: 42, unit: 'кг', trend: 'up' },
    { name: 'Сыр моцарелла', count: 35, unit: 'кг', trend: 'stable' },
    { name: 'Базилик свежий', count: 28, unit: 'кг', trend: 'down' },
    { name: 'Помидоры черри', count: 24, unit: 'кг', trend: 'up' },
    { name: 'Сливки 20%', count: 19, unit: 'л', trend: 'stable' }
  ]

  // Сезонность спроса по категориям
  const seasonalityData = [
    { month: 'Янв', hot: 85, salads: 45, desserts: 60, drinks: 30 },
    { month: 'Фев', hot: 80, salads: 50, desserts: 55, drinks: 35 },
    { month: 'Мар', hot: 75, salads: 65, desserts: 58, drinks: 45 },
    { month: 'Апр', hot: 70, salads: 75, desserts: 62, drinks: 55 },
    { month: 'Май', hot: 65, salads: 85, desserts: 65, drinks: 70 },
    { month: 'Июн', hot: 60, salads: 90, desserts: 68, drinks: 85 }
  ]

  // Эффективность поставщиков
  const suppliersData = [
    { name: 'ООО «ФудСервис»', onTime: 92, quality: 88, total: 156 },
    { name: 'Мясной двор', onTime: 87, quality: 91, total: 98 },
    { name: 'Овощи+', onTime: 78, quality: 85, total: 124 },
    { name: 'Молочный мир', onTime: 95, quality: 93, total: 87 }
  ]

  // Рекомендации по корректировке поставок
  const recommendations = [
    {
      type: 'increase',
      product: 'Молоко 3.2%',
      current: '20 л / неделя',
      suggested: '30 л / неделя',
      reason: 'Частые списания из-за нехватки (+48% за месяц)',
      savings: '≈ 12 000 ₽/мес'
    },
    {
      type: 'decrease',
      product: 'Базилик свежий',
      current: '5 кг / неделя',
      suggested: '3 кг / неделя',
      reason: 'Частое истечение срока годности (-28% спроса)',
      savings: '≈ 8 500 ₽/мес'
    },
    {
      type: 'schedule',
      product: 'Куриное филе',
      current: 'Поставка раз в 5 дней',
      suggested: 'Поставка раз в 3 дня',
      reason: 'Снижение риска истечения срока на 40%',
      savings: '≈ 15 000 ₽/мес'
    }
  ]

  // Ключевые метрики
  const metrics = {
    totalWriteOffs: 1732,
    writeOffCost: 284500,
    avgShelfLife: 6.4,
    onTimeDeliveries: 88
  }

  // ===== ВЫЧИСЛЕНИЯ ДЛЯ ГРАФИКОВ =====
  
  const maxTrendValue = Math.max(...writeOffTrend.map(d => d.value))
  const totalReasons = writeOffReasons.reduce((sum, r) => sum + r.value, 0)
  
  // SVG путь для линейного графика
  const trendPath = useMemo(() => {
    const width = 700
    const height = 200
    const padding = 30
    const stepX = (width - padding * 2) / (writeOffTrend.length - 1)
    
    const points = writeOffTrend.map((d, i) => {
      const x = padding + i * stepX
      const y = height - padding - (d.value / maxTrendValue) * (height - padding * 2)
      return `${x},${y}`
    })
    
    return {
      line: points.join(' '),
      area: `${padding},${height - padding} ${points.join(' ')} ${padding + (writeOffTrend.length - 1) * stepX},${height - padding}`,
      points: writeOffTrend.map((d, i) => ({
        x: padding + i * stepX,
        y: height - padding - (d.value / maxTrendValue) * (height - padding * 2),
        value: d.value,
        label: d.label
      }))
    }
  }, [writeOffTrend, maxTrendValue])

  // SVG для круговой диаграммы
  const pieData = useMemo(() => {
    const radius = 80
    const circumference = 2 * Math.PI * radius
    let offset = 0
    
    return writeOffReasons.map(reason => {
      const percentage = reason.value / totalReasons
      const dashArray = `${percentage * circumference} ${circumference}`
      const dashOffset = -offset
      offset += percentage * circumference
      
      return {
        ...reason,
        percentage: (percentage * 100).toFixed(1),
        dashArray,
        dashOffset
      }
    })
  }, [writeOffReasons, totalReasons])

  // SVG для столбчатой диаграммы
  const barMaxValue = Math.max(...topProducts.map(p => p.count))

  // SVG для графика сезонности
  const seasonPath = useMemo(() => {
    const width = 700
    const height = 200
    const padding = 30
    const stepX = (width - padding * 2) / (seasonalityData.length - 1)
    const maxValue = 100
    
    const createPath = (key) => {
      return seasonalityData.map((d, i) => {
        const x = padding + i * stepX
        const y = height - padding - (d[key] / maxValue) * (height - padding * 2)
        return `${x},${y}`
      }).join(' ')
    }
    
    return {
      hot: createPath('hot'),
      salads: createPath('salads'),
      desserts: createPath('desserts'),
      drinks: createPath('drinks')
    }
  }, [seasonalityData])

  return (
    <div className="page-layout">
      <Sidebar />
      
      <main className="supply-content">
        <div className="page-wrapper">
          
          {/* Заголовок */}
          <div className="page-header-row">
            <div className="page-header-text">
              <h1 className="page-title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Аналитика и прогнозирование
              </h1>
              <p className="page-subtitle">Анализ списаний, сроков годности и оптимизация графика поставок</p>
            </div>
            
            <div className="period-selector">
              {['week', 'month', 'quarter', 'year'].map(p => (
                <button
                  key={p}
                  className={`period-btn ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === 'week' && 'Неделя'}
                  {p === 'month' && 'Месяц'}
                  {p === 'quarter' && 'Квартал'}
                  {p === 'year' && 'Год'}
                </button>
              ))}
            </div>
          </div>

          {/* Ключевые метрики */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon metric-icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="metric-content">
                <p className="metric-label">Всего списаний</p>
                <p className="metric-value">{metrics.totalWriteOffs.toLocaleString('ru-RU')}</p>
                <p className="metric-trend trend-up">+12% к прошлому периоду</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon metric-icon-amber">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="metric-content">
                <p className="metric-label">Стоимость списаний</p>
                <p className="metric-value">{(metrics.writeOffCost / 1000).toFixed(0)}K ₽</p>
                <p className="metric-trend trend-down">-5% к прошлому периоду</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon metric-icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="metric-content">
                <p className="metric-label">Средний срок хранения</p>
                <p className="metric-value">{metrics.avgShelfLife} дн.</p>
                <p className="metric-trend trend-up">+0.8 дн. к прошлому периоду</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon metric-icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="metric-content">
                <p className="metric-label">Точность поставок</p>
                <p className="metric-value">{metrics.onTimeDeliveries}%</p>
                <p className="metric-trend trend-up">+3% к прошлому периоду</p>
              </div>
            </div>
          </div>

          {/* Графики - первый ряд */}
          <div className="charts-row">
            {/* Линейный график динамики списаний */}
            <div className="chart-card chart-card-large">
              <div className="chart-header">
                <h3 className="chart-title">Динамика списаний</h3>
                <span className="chart-badge">Тренд</span>
              </div>
              <div className="chart-body">
                <svg className="line-chart" viewBox="0 0 700 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Сетка */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={i}
                      x1="30"
                      y1={30 + i * 35}
                      x2="670"
                      y2={30 + i * 35}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                  
                  {/* Область под графиком */}
                  <polygon
                    points={trendPath.area}
                    fill="url(#trendGradient)"
                  />
                  
                  {/* Линия */}
                  <polyline
                    points={trendPath.line}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Точки */}
                  {trendPath.points.map((point, i) => (
                    <g key={i}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#ffffff"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      <text
                        x={point.x}
                        y="190"
                        textAnchor="middle"
                        fontSize="11"
                        fill="#64748b"
                      >
                        {point.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Круговая диаграмма причин списаний */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Причины списаний</h3>
                <span className="chart-badge">Распределение</span>
              </div>
              <div className="chart-body pie-chart-container">
                <svg className="pie-chart" viewBox="0 0 200 200">
                  {pieData.map((slice, i) => (
                    <circle
                      key={i}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="30"
                      strokeDasharray={slice.dashArray}
                      strokeDashoffset={slice.dashOffset}
                      transform="rotate(-90 100 100)"
                    />
                  ))}
                  <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="700" fill="#0f172a">
                    {totalReasons}%
                  </text>
                  <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#64748b">
                    Всего
                  </text>
                </svg>
                
                <div className="pie-legend">
                  {pieData.map((slice, i) => (
                    <div key={i} className="legend-item">
                      <span className="legend-dot" style={{ background: slice.color }}></span>
                      <span className="legend-label">{slice.label}</span>
                      <span className="legend-value">{slice.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Графики - второй ряд */}
          <div className="charts-row">
            {/* Столбчатая диаграмма топ продуктов */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Топ продуктов по списаниям</h3>
                <span className="chart-badge">Частота</span>
              </div>
              <div className="chart-body">
                <div className="bar-chart">
                  {topProducts.map((product, i) => (
                    <div key={i} className="bar-item">
                      <div className="bar-label">
                        <span className="bar-name">{product.name}</span>
                        <span className="bar-count">{product.count} {product.unit}</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill"
                          style={{ width: `${(product.count / barMaxValue) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`bar-trend trend-${product.trend}`}>
                        {product.trend === 'up' && '↑'}
                        {product.trend === 'down' && '↓'}
                        {product.trend === 'stable' && '→'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* График сезонности */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Сезонность спроса</h3>
                <span className="chart-badge">По категориям</span>
              </div>
              <div className="chart-body">
                <svg className="multi-line-chart" viewBox="0 0 700 200" preserveAspectRatio="none">
                  {/* Сетка */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={i}
                      x1="30"
                      y1={30 + i * 35}
                      x2="670"
                      y2={30 + i * 35}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                  
                  {/* Линии */}
                  <polyline points={seasonPath.hot} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <polyline points={seasonPath.salads} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  <polyline points={seasonPath.desserts} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <polyline points={seasonPath.drinks} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Подписи месяцев */}
                  {seasonalityData.map((d, i) => (
                    <text
                      key={i}
                      x={30 + i * 128}
                      y="190"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                    >
                      {d.month}
                    </text>
                  ))}
                </svg>
                
                <div className="multi-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                    <span>Горячее</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#10b981' }}></span>
                    <span>Салаты</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                    <span>Десерты</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                    <span>Напитки</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Эффективность поставщиков */}
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3 className="chart-title">Эффективность поставщиков</h3>
              <span className="chart-badge">Рейтинг</span>
            </div>
            <div className="chart-body">
              <div className="suppliers-table">
                <div className="table-header">
                  <span className="col-name">Поставщик</span>
                  <span className="col-metric">Точность</span>
                  <span className="col-metric">Качество</span>
                  <span className="col-metric">Поставок</span>
                  <span className="col-metric">Рейтинг</span>
                </div>
                {suppliersData.map((supplier, i) => {
                  const rating = ((supplier.onTime + supplier.quality) / 2).toFixed(0)
                  return (
                    <div key={i} className="table-row">
                      <span className="col-name">{supplier.name}</span>
                      <span className="col-metric">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${supplier.onTime}%`, background: '#3b82f6' }}></div>
                          <span>{supplier.onTime}%</span>
                        </div>
                      </span>
                      <span className="col-metric">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${supplier.quality}%`, background: '#10b981' }}></div>
                          <span>{supplier.quality}%</span>
                        </div>
                      </span>
                      <span className="col-metric">{supplier.total}</span>
                      <span className={`col-metric rating rating-${rating >= 90 ? 'high' : rating >= 80 ? 'medium' : 'low'}`}>
                        {rating}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Рекомендации по корректировке поставок */}
          <div className="recommendations-section">
            <h2 className="section-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Рекомендации по оптимизации поставок
            </h2>
            
            <div className="recommendations-grid">
              {recommendations.map((rec, i) => (
                <div key={i} className={`recommendation-card rec-${rec.type}`}>
                  <div className="rec-header">
                    <span className={`rec-badge badge-${rec.type}`}>
                      {rec.type === 'increase' && '↑ Увеличить'}
                      {rec.type === 'decrease' && '↓ Уменьшить'}
                      {rec.type === 'schedule' && '📅 Изменить график'}
                    </span>
                    <h4 className="rec-product">{rec.product}</h4>
                  </div>
                  
                  <div className="rec-body">
                    <div className="rec-comparison">
                      <div className="rec-current">
                        <span className="rec-label">Сейчас</span>
                        <span className="rec-value">{rec.current}</span>
                      </div>
                      <svg className="rec-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <div className="rec-suggested">
                        <span className="rec-label">Рекомендуется</span>
                        <span className="rec-value">{rec.suggested}</span>
                      </div>
                    </div>
                    
                    <p className="rec-reason">{rec.reason}</p>
                    
                    <div className="rec-savings">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Экономия: {rec.savings}</span>
                    </div>
                  </div>
                  
                  <button className="rec-apply-btn">Применить</button>
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