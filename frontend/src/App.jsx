import React from 'react'
import { Link } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar.jsx'

const App = () => {
  const menuItems = [
    { name: 'Главная', icon: '', path: '/', active: true },
    { name: 'Поставки', icon: '', path: '/priemps', active: false },
    { name: 'Заказы', icon: '📋', path: '/priemzk', active: false },
    { name: 'Склад', icon: '🏭', path: '/monit', active: false },
    { name: 'Блюда', icon: '🍽️', path: '#', active: false },
    { name: 'Стоп-лист', icon: '🚫', path: '#', active: false },
    { name: 'Аналитика', icon: '', path: '#', active: false },
    { name: 'Настройки', icon: '️', path: '#', active: false },
  ]

  const stats = [
    { title: 'Всего продуктов', value: '248', change: '+12%', subtitle: 'на складе', color: 'emerald' },
    { title: 'Ближайший срок', value: '3 дн.', subtitle: '7 продуктов', color: 'blue' },
    { title: 'Активных заказов', value: '5', subtitle: 'сегодня', color: 'amber' },
    { title: 'В стоп-листе', value: '3', subtitle: 'блюда', color: 'rose' },
  ]

  const expiringSoon = [
    { name: 'Молоко 3.2%', date: '12.05.2025', days: 3, color: 'rose', emoji: '🥛' },
    { name: 'Куриное филе', date: '13.05.2025', days: 4, color: 'amber', emoji: '🍗' },
    { name: 'Салат айсберг', date: '14.05.2025', days: 5, color: 'yellow', emoji: '' },
    { name: 'Помидоры черри', date: '15.05.2025', days: 6, color: 'green', emoji: '🍅' },
  ]

  const hotOffers = [
    { name: 'Паста Карбонара', desc: 'Используются продукты с коротким сроком годности', priority: 'Высокий', prioClass: 'high', score: 95, emoji: '🍝' },
    { name: 'Салат Цезарь', desc: 'Остатки: 2 порции курицы', priority: 'Средний', prioClass: 'med', score: 72, emoji: '' },
    { name: 'Ризотто с грибами', desc: 'Остатки: 1 партия грибов', priority: 'Средний', prioClass: 'med', score: 68, emoji: '🍄' },
  ]

  const recentSupplies = [
    { id: '№4587', date: '24.04.2025', supplier: 'ООО «ФудСервис»', items: 12 },
    { id: '№4586', date: '22.04.2025', supplier: 'Мясной двор', items: 8 },
    { id: '№4585', date: '20.04.2025', supplier: 'Овощи+', items: 15 },
    { id: '№4584', date: '18.04.2025', supplier: 'Молочный мир', items: 6 },
  ]

  const lowStock = [
    { name: 'Говядина', desc: 'для 3 блюд', qty: '2.5 кг', priority: 'Критично', prioClass: 'crit' },
    { name: 'Сыр моцарелла', desc: 'для 2 блюд', qty: '1.2 кг', priority: 'Критично', prioClass: 'crit' },
    { name: 'Базилик', desc: 'для 4 блюд', qty: '250 г', priority: 'Средне', prioClass: 'med' },
    { name: 'Лимоны', desc: 'для 2 блюд', qty: '5 шт', priority: 'Средне', prioClass: 'med' },
  ]

  return (
    <div className="app">
      <div className="layout">

                <Sidebar />

        {/* MAIN */}
        <main className="main">
          <div className="welcome">
            <h1>Добро пожаловать, Алексей!</h1>
            <p>Контролируйте остатки, сроки годности и заказы в одном месте.</p>
          </div>

          {/* STATS */}
          <div className="stats">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className={`stat-icon ${stat.color}`}>📦</div>
                <p className="stat-title">{stat.title}</p>
                <div className="stat-value-row">
                  <p className="stat-value">{stat.value}</p>
                  {stat.change && <span className="stat-change">{stat.change}</span>}
                </div>
                <p className="stat-subtitle">{stat.subtitle}</p>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="charts">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Динамика остатков</h3>
                <select className="card-select">
                  <option>7 дней</option>
                  <option>30 дней</option>
                </select>
              </div>
              <div className="chart-box">
                <svg viewBox="0 0 700 250" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="40,180 140,165 240,190 340,172 440,155 540,168 640,152"
                  />
                  <circle cx="340" cy="172" r="5" fill="white" stroke="#3b82f6" strokeWidth="2" />
                </svg>
                <div className="chart-tooltip">
                  <p>21.04</p>
                  <p>Остаток: 128</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Статус продуктов</h3>
              </div>
              <div className="donut-wrap">
                <svg className="donut-svg" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" stroke="#e2e8f0" strokeWidth="20" fill="none" />
                  <circle cx="100" cy="100" r="80" stroke="#10b981" strokeWidth="20" fill="none"
                    strokeDasharray="361 502" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="80" stroke="#f59e0b" strokeWidth="20" fill="none"
                    strokeDasharray="90 502" strokeDashoffset="-361" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="80" stroke="#ef4444" strokeWidth="20" fill="none"
                    strokeDasharray="51 502" strokeDashoffset="-451" strokeLinecap="round" />
                </svg>
                <div className="donut-center">
                  <p className="donut-value">248</p>
                  <p className="donut-label">всего</p>
                </div>
              </div>
              <div className="legend">
                <div className="legend-row">
                  <div className="legend-left">
                    <span className="legend-dot green"></span>
                    <span className="legend-text">Свежие</span>
                  </div>
                  <div className="legend-right">
                    <span className="legend-pct">72%</span>
                    <span className="legend-count">179</span>
                  </div>
                </div>
                <div className="legend-row">
                  <div className="legend-left">
                    <span className="legend-dot amber"></span>
                    <span className="legend-text">Скоро истекают</span>
                  </div>
                  <div className="legend-right">
                    <span className="legend-pct">18%</span>
                    <span className="legend-count">45</span>
                  </div>
                </div>
                <div className="legend-row">
                  <div className="legend-left">
                    <span className="legend-dot rose"></span>
                    <span className="legend-text">Просроченные</span>
                  </div>
                  <div className="legend-right">
                    <span className="legend-pct">10%</span>
                    <span className="legend-count">24</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLES */}
          <div className="tables">
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">Последние поставки</h3>
                <Link to="/priemps" className="card-link">Все →</Link>
              </div>
              <div className="row-list">
                {recentSupplies.map((s) => (
                  <div key={s.id} className="row-item">
                    <div className="row-left">
                      <div className="row-icon"></div>
                      <div className="row-info">
                        <p className="row-title">Поставка {s.id}</p>
                        <p className="row-sub">{s.date} • {s.supplier}</p>
                      </div>
                    </div>
                    <div className="row-right">
                      <span className="row-items">+{s.items} позиций</span>
                      <span className="badge-ok">Принята</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">Недостаточные ингредиенты</h3>
                <Link to="/monit" className="card-link">Все →</Link>
              </div>
              <div className="row-list">
                {lowStock.map((item, idx) => (
                  <div key={idx} className="row-item">
                    <div className="row-left">
                      <div className="row-icon emoji">🥩</div>
                      <div className="row-info">
                        <p className="row-title">{item.name}</p>
                        <p className="row-sub">{item.desc}</p>
                      </div>
                    </div>
                    <div className="row-right">
                      <span className="row-items">{item.qty}</span>
                      <span className={item.prioClass === 'crit' ? 'badge-crit' : 'badge-med'}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="right-side">
          <div className="side-card">
            <div className="side-card-head">
              <div className="side-card-head-left">
                <div className="side-icon rose">⏰</div>
                <h3 className="side-card-title">Скоро истекают</h3>
              </div>
              <span className="side-badge">7</span>
            </div>
            <div className="side-list">
              {expiringSoon.map((item, idx) => (
                <div key={idx} className="side-item">
                  <div className="side-item-icon">{item.emoji}</div>
                  <div className="side-item-body">
                    <p className="side-item-title">{item.name}</p>
                    <p className="side-item-sub">{item.date}</p>
                  </div>
                  <span className={`side-item-days ${item.color}`}>{item.days} дн.</span>
                </div>
              ))}
            </div>
          </div>

          <div className="side-card">
            <div className="side-card-head">
              <div className="side-card-head-left">
                <div className="side-icon orange">🔥</div>
                <h3 className="side-card-title">Горячие предложения</h3>
              </div>
            </div>
            <div className="side-list">
              {hotOffers.map((offer, idx) => (
                <div key={idx} className="side-item">
                  <div className="side-item-icon big">{offer.emoji}</div>
                  <div className="side-item-body">
                    <p className="side-item-title">{offer.name}</p>
                    <p className="side-item-sub">{offer.desc}</p>
                    <span className={`side-item-prio ${offer.prioClass}`}>
                      {offer.priority} приоритет
                    </span>
                  </div>
                  <div className="side-item-score">
                    <span>{offer.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App