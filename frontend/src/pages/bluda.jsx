import React, { useState, useMemo, useEffect } from 'react'
import './bluda.css'
import Sidebar from "../components/Sidebar.jsx"
import { fetchDishes, fetchCategories } from './api' 
import { Plus, X, Flame, AlertCircle } from 'lucide-react'

// ==========================================
// 🚨 ВРЕМЕННЫЕ МОК-ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ
// Чтобы удалить: поставь USE_MOCK_DATA = false и удали массивы ниже
// ==========================================
const USE_MOCK_DATA = true

const MOCK_CATEGORIES = [
  { id: 1, name: 'Горячее' },
  { id: 2, name: 'Салаты' },
  { id: 3, name: 'Десерты' },
  { id: 4, name: 'Напитки' }
]

const MOCK_DISHES = [
  {
    id: 101,
    name: 'Стейк Рибай с овощами',
    description: 'Сочный стейк прожарки Medium с гарниром из спаржи.',
    categoryId: 1,
    prepTimeMinutes: 25,
    calories: 650,
    ingredients: [
      { name: 'Говядина (Рибай)', quantity: 300, unit: 'г', daysToExpire: 1, stockQty: 45 }, // 🔥 Критично: 1 день, много на складе
      { name: 'Спаржа', quantity: 150, unit: 'г', daysToExpire: 2, stockQty: 30 },          // 🔥 Критично: 2 дня
      { name: 'Масло сливочное', quantity: 20, unit: 'г', daysToExpire: 15, stockQty: 50 }  // ОК
    ]
  },
  {
    id: 102,
    name: 'Салат Цезарь',
    description: 'Классический салат с куриной грудкой и пармезаном.',
    categoryId: 2,
    prepTimeMinutes: 15,
    calories: 320,
    ingredients: [
      { name: 'Салат Айсберг', quantity: 100, unit: 'г', daysToExpire: -1, stockQty: 15 }, // 🚨 УЖЕ ПРОСРОЧЕН!
      { name: 'Куриное филе', quantity: 120, unit: 'г', daysToExpire: 4, stockQty: 40 },
      { name: 'Пармезан', quantity: 30, unit: 'г', daysToExpire: 20, stockQty: 10 }
    ]
  },
  {
    id: 103,
    name: 'Тирамису',
    description: 'Итальянский десерт с сыром маскарпоне и кофе.',
    categoryId: 3,
    prepTimeMinutes: 10,
    calories: 450,
    ingredients: [
      { name: 'Маскарпоне', quantity: 150, unit: 'г', daysToExpire: 12, stockQty: 20 }, // ОК, свежее
      { name: 'Печенье Савоярди', quantity: 100, unit: 'г', daysToExpire: 30, stockQty: 50 }
    ]
  },
  {
    id: 104,
    name: 'Лимонад Домашний',
    description: 'Освежающий напиток с мятой и цитрусами.',
    categoryId: 4,
    prepTimeMinutes: 5,
    calories: 120,
    ingredients: [
      { name: 'Лимон', quantity: 50, unit: 'г', daysToExpire: 3, stockQty: 60 },  // 🔥 На грани, но много на складе
      { name: 'Мята', quantity: 5, unit: 'г', daysToExpire: 2, stockQty: 10 }     // 🔥 Критично
    ]
  },
  {
    id: 105,
    name: 'Паста Карбонара',
    description: 'Классическая паста с беконом и сливочным соусом.',
    categoryId: 1,
    prepTimeMinutes: 20,
    calories: 580,
    ingredients: [
      { name: 'Спагетти', quantity: 100, unit: 'г', daysToExpire: 60, stockQty: 100 },
      { name: 'Бекон', quantity: 80, unit: 'г', daysToExpire: 5, stockQty: 25 },
      { name: 'Яйцо', quantity: 2, unit: 'шт', daysToExpire: 7, stockQty: 40 }
    ]
  }
]
// ==========================================
// КОНЕЦ МОК-ДАННЫХ
// ==========================================

const Bluda = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  
  const [dishes, setDishes] = useState([])
  const [filterCategories, setFilterCategories] = useState(['Все'])
  const [isLoading, setIsLoading] = useState(true)

  // Состояние для ручного добавления в горячие предложения
  const [manualHotOffers, setManualHotOffers] = useState([]) // Массив ID блюд
  const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
    const loadData = async () => {
      try {
        let dishesData, categoriesData

        if (USE_MOCK_DATA) {
          // 🟢 ИСПОЛЬЗУЕМ МОК-ДАННЫЕ
          await new Promise(resolve => setTimeout(resolve, 600)) // Имитация задержки сети
          dishesData = MOCK_DISHES
          categoriesData = MOCK_CATEGORIES
          console.log('🟢 Загружены МОК-данные для тестирования')
        } else {
          // 🔵 ИСПОЛЬЗУЕМ РЕАЛЬНЫЙ БЕКЕНД
          const [fetchedDishes, fetchedCategories] = await Promise.all([
            fetchDishes(),
            fetchCategories()
          ])
          dishesData = fetchedDishes
          categoriesData = fetchedCategories
        }

        const formattedDishes = dishesData.map(dish => {
          const categoryObj = categoriesData.find(c => c.id === dish.categoryId)
          const categoryName = categoryObj ? categoryObj.name : 'Неизвестно'

          const formattedIngredients = (dish.ingredients && dish.ingredients.length > 0)
            ? dish.ingredients.map(ing => {
                // Если данные пришли с бека без daysToExpire/stockQty, ставим заглушки, чтобы не упало
                const days = ing.daysToExpire !== undefined ? ing.daysToExpire : Math.floor(Math.random() * 10)
                const stock = ing.stockQty !== undefined ? ing.stockQty : Math.floor(Math.random() * 50) + 5
                
                return {
                  ...ing,
                  daysToExpire: days, 
                  stockQty: stock,
                  display: `${ing.name} — ${ing.quantity} ${ing.unit} (Ост: ${stock}, до списания: ${days} дн.)`
                }
              })
            : [{ name: 'Не указано', quantity: 0, unit: '', daysToExpire: 99, stockQty: 0, display: 'Состав не указан' }]

          return {
            ...dish,
            category: categoryName,
            prepTime: dish.prepTimeMinutes ? `${dish.prepTimeMinutes} мин` : 'Не указано',
            calories: dish.calories ? `${dish.calories} ккал` : 'Не указано',
            ingredients: formattedIngredients
          }
        })

        setDishes(formattedDishes)
        const uniqueCategories = ['Все', ...new Set(formattedDishes.map(d => d.category))]
        setFilterCategories(uniqueCategories)
        
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 🔥 АЛГОРИТМ РАСЧЕТА ПРИОРИТЕТА ГОРЯЧИХ ПРЕДЛОЖЕНИЙ
  const hotOffers = useMemo(() => {
    const today = new Date()
    
    // 1. Считаем score для каждого блюда
    const scoredDishes = dishes.map(dish => {
      let score = 0
      let criticalIngredients = []

      dish.ingredients.forEach(ing => {
        // Если до списания <= 3 дней, даем высокие очки
        if (ing.daysToExpire <= 3 && ing.daysToExpire >= 0) {
          const urgency = (4 - ing.daysToExpire) * 10 // 10, 20, 30, 40 очков
          const stockWeight = ing.stockQty > 20 ? 1.5 : 1 // Бонус, если на складе много
          score += urgency * stockWeight
          criticalIngredients.push(ing.name)
        } else if (ing.daysToExpire < 0) {
          score += 100 // Критически: уже просрочено!
          criticalIngredients.push(ing.name)
        }
      })

      return { ...dish, score, criticalIngredients }
    })

    // 2. Сортируем: сначала ручные добавления, потом по убыванию score
    return scoredDishes
      .filter(d => d.score > 0 || manualHotOffers.includes(d.id))
      .sort((a, b) => {
        const aIsManual = manualHotOffers.includes(a.id) ? 1000 : 0
        const bIsManual = manualHotOffers.includes(b.id) ? 1000 : 0
        return (b.score + bIsManual) - (a.score + aIsManual)
      })
      .slice(0, 6) // Показываем топ-6
  }, [dishes, manualHotOffers])

  const filteredDishes = useMemo(() => {
    let result = dishes

    if (selectedCategory !== 'Все') {
      result = result.filter(dish => dish.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(dish => 
        dish.name.toLowerCase().includes(query) || 
        (dish.ingredients && dish.ingredients.some(ing => ing.display.toLowerCase().includes(query)))
      )
    }

    return result.sort((a, b) => {
      if (a.category === 'Горячее' && b.category !== 'Горячее') return -1
      if (a.category !== 'Горячее' && b.category === 'Горячее') return 1
      return a.name.localeCompare(b.name)
    })
  }, [searchQuery, selectedCategory, dishes])

  const toggleManualHotOffer = (dishId) => {
    if (manualHotOffers.includes(dishId)) {
      setManualHotOffers(prev => prev.filter(id => id !== dishId))
    } else {
      setManualHotOffers(prev => [...prev, dishId])
    }
  }

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Горячее': return 'badge-hot'
      case 'Салаты': return 'badge-salad'
      case 'Десерты': return 'badge-dessert'
      case 'Напитки': return 'badge-drink'
      case 'Супы': return 'badge-soup'
      default: return 'badge-default'
    }
  }

  if (isLoading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="supply-content">
          <div className="page-wrapper">
            <h2>Загрузка меню...</h2>
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
            <div className="header-left">
              <h1 className="page-title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Меню и рецепты
              </h1>
              <p className="page-subtitle">
                Управление технологическими картами. Горячие блюда отображаются первыми.
              </p>
            </div>
            
            {/* Кнопка ручного добавления */}
            <button className="add-hot-offer-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              <span>Добавить в предложение</span>
            </button>
          </div>

          {/* 🔥 БЛОК ГОРЯЧИХ ПРЕДЛОЖЕНИЙ */}
          {hotOffers.length > 0 && (
            <div className="hot-offers-section">
              <div className="hot-offers-header">
                <Flame className="fire-icon" size={24} />
                <h3>Горячие предложения</h3>
                <span className="hot-offers-subtitle">
                  Рекомендуется к продаже для списания продуктов с истекающим сроком
                </span>
              </div>
              <div className="hot-offers-grid">
                {hotOffers.map(dish => (
                  <div key={dish.id} className={`hot-offer-card ${manualHotOffers.includes(dish.id) ? 'manual-pinned' : ''}`}>
                    <div className="hot-card-header">
                      <span className={`category-badge ${getCategoryBadgeClass(dish.category)}`}>
                        {dish.category}
                      </span>
                      {manualHotOffers.includes(dish.id) && (
                        <span className="manual-badge" title="Добавлено вручную">📌 Ручное</span>
                      )}
                    </div>
                    <h4 className="hot-dish-name">{dish.name}</h4>
                    <div className="hot-ingredients-warning">
                      <AlertCircle size={14} />
                      <span>
                        {dish.criticalIngredients.length > 0 
                          ? `Критично: ${dish.criticalIngredients.slice(0, 2).join(', ')}${dish.criticalIngredients.length > 2 ? '...' : ''}` 
                          : 'Добавлено вручную'}
                      </span>
                    </div>
                    <button 
                      className="remove-hot-btn"
                      onClick={() => toggleManualHotOffer(dish.id)}
                      title={manualHotOffers.includes(dish.id) ? "Убрать из ручных" : "Закрепить вручную"}
                    >
                      {manualHotOffers.includes(dish.id) ? <X size={16} /> : <Plus size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="controls-bar">
            <div className="search-box">
              <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Поиск блюда или ингредиента..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="category-filters">
              {filterCategories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="dishes-grid">
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => (
                <div key={dish.id} className={`dish-card ${manualHotOffers.includes(dish.id) ? 'dish-card-hot' : ''}`}>
                  <div className="dish-header">
                    <span className={`category-badge ${getCategoryBadgeClass(dish.category)}`}>
                      {dish.category === 'Горячее' && '🔥 '}
                      {dish.category}
                    </span>
                    {manualHotOffers.includes(dish.id) && <span className="card-manual-badge">📌</span>}
                    <h3 className="dish-name">{dish.name}</h3>
                  </div>
                  
                  <div className="dish-body">
                    <p className="dish-description">{dish.description}</p>
                    
                    <div className="ingredients-section">
                      <h4 className="ingredients-title">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Ингредиенты:
                      </h4>
                      <ul className="ingredients-list">
                        {dish.ingredients.map((ing, idx) => (
                          <li key={idx} className={`ingredient-item ${ing.daysToExpire <= 3 ? 'ingredient-critical' : ''}`}>
                            {ing.display}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="dish-footer">
                    <div className="dish-meta">
                      <span className="meta-item">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {dish.prepTime}
                      </span>
                      <span className="meta-item">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                        {dish.calories}
                      </span>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Блюда не найдены. Попробуйте изменить параметры поиска.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* 🔥 МОДАЛЬНОЕ ОКНО ДЛЯ РУЧНОГО ДОБАВЛЕНИЯ */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Добавить в горячие предложения</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <input 
                type="text" 
                placeholder="Поиск блюда..." 
                className="modal-search"
                onChange={(e) => setSearchQuery(e.target.value)} // Используем тот же стейт для простоты
              />
              <div className="modal-dishes-list">
                {dishes.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map(dish => (
                  <div key={dish.id} className="modal-dish-item">
                    <div className="modal-dish-info">
                      <span className="modal-dish-name">{dish.name}</span>
                      <span className="modal-dish-cat">{dish.category}</span>
                    </div>
                    <button 
                      className={`modal-toggle-btn ${manualHotOffers.includes(dish.id) ? 'active' : ''}`}
                      onClick={() => toggleManualHotOffer(dish.id)}
                    >
                      {manualHotOffers.includes(dish.id) ? 'Убрать' : 'Добавить'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bluda