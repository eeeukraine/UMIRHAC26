import React, { useState, useMemo, useEffect } from 'react'
import './stoplist.css'
import Sidebar from "../components/Sidebar.jsx"

const StopList = () => {
  const [allDishes, setAllDishes] = useState([])
  const [stopList, setStopList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [manualReason, setManualReason] = useState('')
  const [selectedDish, setSelectedDish] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Загружаем блюда и автоматический стоп-лист параллельно
      const [dishesRes, stopListRes] = await Promise.all([
        fetch('http://localhost:8080/api/dishes'),
        fetch('http://localhost:8080/api/stop-list')
      ])

      const dishesData = await dishesRes.json()
      const stopListData = await stopListRes.json()

      setAllDishes(dishesData)
      setStopList(stopListData)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToStopList = async (dish, reason = 'Нет ингредиентов') => {
    try {
      const response = await fetch('http://localhost:8080/api/stop-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishId: dish.id,
          dishName: dish.name,
          reason: reason
        })
      })

      if (response.ok) {
        await loadData()
        setIsModalOpen(false)
        setSearchQuery('')
        setManualReason('')
        setSelectedDish(null)
      }
    } catch (err) {
      console.error('Ошибка добавления в стоп-лист:', err)
      alert('Не удалось добавить блюдо в стоп-лист')
    }
  }

  const handleRemoveFromStopList = async (dishId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/stop-list/${dishId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadData()
      }
    } catch (err) {
      console.error('Ошибка удаления из стоп-листа:', err)
      alert('Не удалось удалить блюдо из стоп-листа')
    }
  }

  const handleManualAdd = () => {
    if (selectedDish && manualReason.trim()) {
      handleAddToStopList(selectedDish, manualReason)
    }
  }

  // Фильтруем блюда: ищем по названию ИСКЛЮЧАЯ те, что уже в стоп-листе
  const availableDishes = useMemo(() => {
    const stoppedIds = new Set(stopList.map(item => item.dishId || item.id))
    
    return allDishes.filter(dish => {
      const isNotStopped = !stoppedIds.has(dish.id)
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase())
      return isNotStopped && matchesSearch
    })
  }, [allDishes, stopList, searchQuery])

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="supply-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка стоп-листа...</p>
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
          
          {/* Заголовок и кнопка добавления */}
          <div className="page-header-row">
            <div className="page-header-text">
              <h1 className="page-title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Стоп-лист блюд
              </h1>
              <p className="page-subtitle">
                Управление блюдами, которые временно недоступны для заказа
                {stopList.length > 0 && (
                  <span className="auto-badge">Автообновление: {stopList.length} блюд</span>
                )}
              </p>
            </div>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Добавить в стоп-лист</span>
            </button>
          </div>

          {/* Сетка текущего стоп-листа */}
          <div className="stoplist-grid">
            {stopList.length > 0 ? (
              stopList.map((item) => (
                <div key={item.id} className="stoplist-card">
                  <div className="stoplist-card-header">
                    <span className="category-badge badge-default">{item.dishName}</span>
                    <button 
                      className="remove-btn" 
                      onClick={() => handleRemoveFromStopList(item.id)}
                      title="Удалить из стоп-листа"
                    >
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="stoplist-card-body">
                    <div className="info-row">
                      <svg className="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="info-text">{item.reason}</span>
                    </div>
                    {item.addedAt && (
                      <div className="info-row">
                        <svg className="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="info-text time">
                          {new Date(item.addedAt).toLocaleString('ru-RU')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-large">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>Стоп-лист пуст</h3>
                <p>Все блюда доступны для приготовления и заказа.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно добавления */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Добавить блюдо в стоп-лист</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-search">
              <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Поиск блюда..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="modal-search-input"
                autoFocus
              />
            </div>

            {selectedDish && (
              <div className="manual-reason-section">
                <label className="form-label">Причина добавления:</label>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Например: Закончился сыр моцарелла"
                  className="form-input"
                />
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => {
                    setSelectedDish(null)
                    setManualReason('')
                  }}>
                    Отмена
                  </button>
                  <button 
                    className="btn-confirm"
                    onClick={handleManualAdd}
                    disabled={!manualReason.trim()}
                  >
                    Добавить в стоп-лист
                  </button>
                </div>
              </div>
            )}

            <div className="modal-list-container">
              {availableDishes.length > 0 ? (
                <ul className="modal-list">
                  {availableDishes.map((dish) => (
                    <li key={dish.id} className="modal-list-item">
                      <div className="dish-info">
                        <span className="dish-name">{dish.name}</span>
                        <span className="dish-category">{dish.category || 'Без категории'}</span>
                      </div>
                      <button 
                        className="btn-add-small"
                        onClick={() => {
                          setSelectedDish(dish)
                          setManualReason('')
                        }}
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Добавить
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="modal-empty">
                  <p>Блюда не найдены. Возможно, все блюда уже в стоп-листе.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StopList