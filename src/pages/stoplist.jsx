import React, { useState, useMemo } from 'react'
import './stoplist.css'
import Sidebar from "../components/Sidebar.jsx"

const StopList = () => {
  // Демо-данные: все доступные блюда в меню
  const allDishes = [
    { id: 1, name: 'Борщ с пампушками', category: 'Горячее' },
    { id: 2, name: 'Паста Карбонара', category: 'Горячее' },
    { id: 3, name: 'Салат Цезарь', category: 'Салаты' },
    { id: 4, name: 'Стейк Рибай', category: 'Горячее' },
    { id: 5, name: 'Тирамису', category: 'Десерты' },
    { id: 6, name: 'Морс клюквенный', category: 'Напитки' },
    { id: 7, name: 'Суп-пюре из тыквы', category: 'Супы' },
    { id: 8, name: 'Хачапури по-аджарски', category: 'Выпечка' },
  ]

  // Демо-данные: текущий стоп-лист
  const [stopList, setStopList] = useState([
    { id: 1, dishId: 1, dishName: 'Борщ с пампушками', reason: 'Закончилась свекла', addedAt: '2024-05-10 14:30' },
    { id: 2, dishId: 4, dishName: 'Стейк Рибай', reason: 'Нет мраморной говядины', addedAt: '2024-05-10 15:15' },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Фильтруем блюда: ищем по названию ИСКЛЮЧАЯ те, что уже в стоп-листе
  const availableDishes = useMemo(() => {
    const stoppedIds = new Set(stopList.map(item => item.dishId))
    
    return allDishes.filter(dish => {
      const isNotStopped = !stoppedIds.has(dish.id)
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            dish.category.toLowerCase().includes(searchQuery.toLowerCase())
      return isNotStopped && matchesSearch
    })
  }, [stopList, searchQuery])

  const handleAddToStopList = (dish) => {
    const newItem = {
      id: Date.now(),
      dishId: dish.id,
      dishName: dish.name,
      reason: 'Нет ингредиентов', // В реальном проекте здесь можно открыть ввод причины
      addedAt: new Date().toLocaleString('ru-RU')
    }
    setStopList(prev => [...prev, newItem])
    setSearchQuery('') // Сброс поиска после добавления
  }

  const handleRemoveFromStopList = (id) => {
    setStopList(prev => prev.filter(item => item.id !== id))
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
              <p className="page-subtitle">Управление блюдами, которые временно недоступны для заказа</p>
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
                    <div className="info-row">
                      <svg className="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="info-text time">{item.addedAt}</span>
                    </div>
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
                placeholder="Поиск блюда или категории..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="modal-search-input"
                autoFocus
              />
            </div>

            <div className="modal-list-container">
              {availableDishes.length > 0 ? (
                <ul className="modal-list">
                  {availableDishes.map((dish) => (
                    <li key={dish.id} className="modal-list-item">
                      <div className="dish-info">
                        <span className="dish-name">{dish.name}</span>
                        <span className="dish-category">{dish.category}</span>
                      </div>
                      <button 
                        className="btn-add-small"
                        onClick={() => handleAddToStopList(dish)}
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
                  <p>Блюда не найдены. Возможно, оно уже в стоп-листе.</p>
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