import React, { useState, useMemo, useEffect } from 'react'
import './bluda.css'
import Sidebar from "../components/Sidebar.jsx"
import { fetchDishes, fetchCategories } from './api' 

const Bluda = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все')
  
  const [dishes, setDishes] = useState([])
  const [filterCategories, setFilterCategories] = useState(['Все'])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dishesData, categoriesData] = await Promise.all([
          fetchDishes(),
          fetchCategories()
        ])

        const formattedDishes = dishesData.map(dish => {
          const categoryObj = categoriesData.find(c => c.id === dish.categoryId)
          const categoryName = categoryObj ? categoryObj.name : 'Неизвестно'

          // 🌟 Форматируем ингредиенты из объектов в красивые строки
          const formattedIngredients = (dish.ingredients && dish.ingredients.length > 0)
            ? dish.ingredients.map(ing => `${ing.name} — ${ing.quantity} ${ing.unit}`)
            : ['Состав не указан']

          return {
            ...dish,
            category: categoryName,
            prepTime: dish.prepTimeMinutes ? `${dish.prepTimeMinutes} мин` : 'Не указано',
            calories: dish.calories ? `${dish.calories} ккал` : 'Не указано',
            ingredients: formattedIngredients // Теперь здесь массив строк
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

  const filteredDishes = useMemo(() => {
    let result = dishes

    if (selectedCategory !== 'Все') {
      result = result.filter(dish => dish.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(dish => 
        dish.name.toLowerCase().includes(query) || 
        (dish.ingredients && dish.ingredients.some(ing => ing.toLowerCase().includes(query)))
      )
    }

    return result.sort((a, b) => {
      if (a.category === 'Горячее' && b.category !== 'Горячее') return -1
      if (a.category !== 'Горячее' && b.category === 'Горячее') return 1
      return a.name.localeCompare(b.name)
    })
  }, [searchQuery, selectedCategory, dishes])

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
            <h1 className="page-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Меню и рецепты
            </h1>
            <p className="page-subtitle">
              Управление технологическими картами и списком блюд. Горячие блюда отображаются первыми.
            </p>
          </div>

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
                <div key={dish.id} className="dish-card">
                  <div className="dish-header">
                    <span className={`category-badge ${getCategoryBadgeClass(dish.category)}`}>
                      {dish.category === 'Горячее' && '🔥 '}
                      {dish.category}
                    </span>
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
                          <li key={idx} className="ingredient-item">{ing}</li>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                        {dish.calories}
                      </span>
                    </div>
                    <button className="edit-btn">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Рецепт
                    </button>
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
    </div>
  )
}

export default Bluda