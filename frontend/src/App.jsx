import React from 'react'
import { Link } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar.jsx'

const Dashboard = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-gradient">Обзор системы</span>
            </h1>
          </div>
          <div className="header-actions">
            <div className="date-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </header>

        {/* KPI СЕТКА — только Склад и Заказы */}
        <section className="kpi-grid kpi-grid-2">
          <Link to="/monit" className="kpi-card kpi-clickable">
            <div className="kpi-glow emerald"></div>
            <div className="kpi-icon-wrapper emerald">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Склад</span>
              <span className="kpi-value">248</span>
              <span className="kpi-subtitle">позиций на складе</span>
              <div className="kpi-trend positive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                <span>+12% за неделю</span>
              </div>
            </div>
            <div className="kpi-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </Link>

          <Link to="/priemzk" className="kpi-card kpi-clickable">
            <div className="kpi-glow amber"></div>
            <div className="kpi-icon-wrapper amber">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Заказы</span>
              <span className="kpi-value">5</span>
              <span className="kpi-subtitle">активных заказов</span>
              <div className="kpi-trend neutral">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>3 ожидают подтверждения</span>
              </div>
            </div>
            <div className="kpi-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </Link>
        </section>

        {/* ПОСЛЕДНЯЯ АКТИВНОСТЬ — теперь идёт ПЕРВОЙ */}
        <section className="activity-section">
          <div className="data-panel full-width">
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <div className="panel-icon info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h3>Последняя активность</h3>
              </div>
              <div className="panel-tabs">
                <Link to="/priemps" className="tab-link active">Поставки</Link>
                <Link to="/priemzk" className="tab-link">Заказы</Link>
              </div>
            </div>
            <div className="panel-body activity-list">
              <div className="activity-row">
                <div className="activity-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
                <div className="activity-details">
                  <span className="activity-title">Поставка №4587 принята</span>
                  <span className="activity-meta">ООО «ФудСервис» • 12 позиций • Сегодня, 10:30</span>
                </div>
                <Link to="/priemps" className="activity-link">
                  Детали
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
              <div className="activity-row">
                <div className="activity-icon amber">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="activity-details">
                  <span className="activity-title">Создан заказ поставщику</span>
                  <span className="activity-meta">Мясной двор • 8 позиций • Ожидает подтверждения • Сегодня, 09:15</span>
                </div>
                <Link to="/priemzk" className="activity-link">
                  Детали
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
              <div className="activity-row">
                <div className="activity-icon rose">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div className="activity-details">
                  <span className="activity-title">Автоматическое списание</span>
                  <span className="activity-meta">Базилик свежий (0.5 кг) • Причина: Истек срок • Вчера, 09:15</span>
                </div>
                <Link to="/spisaniya" className="activity-link">
                  Детали
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ЗОНЫ ДЕЙСТВИЯ — Критические остатки и Истекающий срок */}
        <section className="action-grid">
          <div className="data-panel">
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <div className="panel-icon critical">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3>Критические остатки</h3>
              </div>
              <Link to="/stoplist" className="panel-link">
                Стоп-лист
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
            <div className="panel-body">
              <div className="critical-item">
                <div className="critical-badge critical">
                  <span className="badge-dot"></span>
                  <span>Критично</span>
                </div>
                <div className="critical-info">
                  <span className="critical-name">Говядина мраморная</span>
                  <span className="critical-desc">Остаток: 2.5 кг • Хватит на 3 блюда</span>
                </div>
                <Link to="/monit" className="critical-action">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Заказать
                </Link>
              </div>
              <div className="critical-item">
                <div className="critical-badge critical">
                  <span className="badge-dot"></span>
                  <span>Критично</span>
                </div>
                <div className="critical-info">
                  <span className="critical-name">Сыр Моцарелла</span>
                  <span className="critical-desc">Остаток: 1.2 кг • Хватит на 2 блюда</span>
                </div>
                <Link to="/monit" className="critical-action">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Заказать
                </Link>
              </div>
              <div className="critical-item stopped">
                <div className="critical-badge stopped">
                  <span className="badge-dot"></span>
                  <span>В стоп-листе</span>
                </div>
                <div className="critical-info">
                  <span className="critical-name">Тигровые креветки</span>
                  <span className="critical-desc">Нет на складе • 0 кг</span>
                </div>
                <Link to="/stoplist" className="critical-action secondary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Снять
                </Link>
              </div>
            </div>
          </div>

          <div className="data-panel">
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <div className="panel-icon warning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3>Истекающий срок годности</h3>
              </div>
              <Link to="/spisaniya" className="panel-link">
                Все списания
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
            <div className="panel-body">
              <div className="expiring-item">
                <div className="expiring-days bad">
                  <span className="days-value">3</span>
                  <span className="days-label">дн.</span>
                </div>
                <div className="expiring-info">
                  <span className="expiring-name">Молоко 3.2%</span>
                  <span className="expiring-desc">Партия №201 • 15 л • Молочный мир</span>
                </div>
                <Link to="/spisaniya" className="expiring-action">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  Использовать
                </Link>
              </div>
              <div className="expiring-item">
                <div className="expiring-days warning">
                  <span className="days-value">4</span>
                  <span className="days-label">дн.</span>
                </div>
                <div className="expiring-info">
                  <span className="expiring-name">Куриное филе</span>
                  <span className="expiring-desc">Партия №301 • 12 кг • Мясной двор</span>
                </div>
                <Link to="/spisaniya" className="expiring-action">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  Использовать
                </Link>
              </div>
              <div className="expiring-item">
                <div className="expiring-days warning">
                  <span className="days-value">5</span>
                  <span className="days-label">дн.</span>
                </div>
                <div className="expiring-info">
                  <span className="expiring-name">Салат Айсберг</span>
                  <span className="expiring-desc">Партия №112 • 4 кг • Овощи+</span>
                </div>
                <Link to="/spisaniya" className="expiring-action">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  Использовать
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard