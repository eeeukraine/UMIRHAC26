import React, { useState, useEffect } from 'react';
import { fetchDishes, fetchStopList, createOrder } from '../api';

// Убедись, что путь к картинке правильный!
import bgImage from './bg.png'; 

const NewOrder = () => {
  const [dishes, setDishes] = useState([]);
  const [stopList, setStopList] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dishesData, stopListData] = await Promise.all([
        fetchDishes(),
        fetchStopList()
      ]);
      setDishes(dishesData);
      setStopList(stopListData);
    } catch (err) {
      console.error(err);
      setMessage('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const stoppedDishIds = new Set(stopList.map(item => item.id));

  const filteredDishes = dishes.filter(dish => {
    if (activeCategory === 'all') return true;
    return dish.category === activeCategory;
  });

  const addToCart = (dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dishId === dish.id);
      if (existing) {
        return prev.map(item => 
          item.dishId === dish.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dishId: dish.id, dishName: dish.name, price: dish.price || 0, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId) => {
    setCart(prev => {
      const existing = prev.find(item => item.dishId === dishId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.dishId === dishId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.dishId !== dishId);
    });
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      setMessage('Выберите стол');
      return;
    }
    if (cart.length === 0) {
      setMessage('Корзина пуста');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        tableNumber: parseInt(selectedTable),
        status: 'new',
        items: cart.map(item => ({
          dishId: item.dishId,
          dishName: item.dishName,
          quantity: item.quantity
        }))
      };

      const result = await createOrder(orderData);

      if (result.success) {
        setMessage(`Заказ ${result.order.orderNumber} создан!`);
        setCart([]);
        setSelectedTable('');
      } else {
        setMessage(`Ошибка: ${result.message}`);
      }
    } catch (err) {
      setMessage('Ошибка создания заказа');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['all', ...new Set(dishes.map(d => d.category || 'Без категории').filter(Boolean))];

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Загрузка...</div>;
  }

  // ... (весь код до return остаётся без изменений)

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. СЛОЙ С ФОНОМ — БЕЗ ИЗМЕНЕНИЙ */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${bgImage})`,
        filter: 'blur(12px)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0
      }} />
      
      {/* 2. УБРАЛ ЗАТЕМНЕНИЕ — ФОТО ОСТАЁТСЯ ЧИСТЫМ */}
      
      {/* 3. КОНТЕНТ (ПАНЕЛИ) */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', width: '100%', height: '100%' }}>
        
        {/* ЛЕВАЯ ЧАСТЬ: МЕНЮ */}
        <div style={{ 
          flex: 1, 
          padding: '25px', 
          overflowY: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ marginBottom: '20px', color: '#fff', fontSize: '28px', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>️ Меню</h1>
          
          {/* Фильтр по категориям */}
          <div style={{ marginBottom: '25px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '10px 20px',
                  background: activeCategory === cat ? '#4CAF50' : 'rgba(255,255,255,0.9)',
                  color: activeCategory === cat ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {cat === 'all' ? 'Все блюда' : cat}
              </button>
            ))}
          </div>

          {/* Сетка блюд */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
            {filteredDishes.map(dish => {
              const isStopped = stoppedDishIds.has(dish.id);
              return (
                <div
  key={dish.id}
  style={{
    background: isStopped 
      ? 'rgba(244, 67, 54, 0.55)' //  Ярче красный для недоступных
      : 'rgba(255, 255, 255, 1)', // ⚪ Прозрачнее для эффекта стекла
    padding: '18px',
    borderRadius: '16px',
    boxShadow: isStopped 
      ? '0 4px 15px rgba(244, 67, 54, 0.7)' // 🔴 Красное свечение
      : '0 8px 32px rgba(0, 0, 0, 0.19)', // ⚪ Мягкая тень
    backdropFilter: isStopped
      ? 'blur(25px)' // 🔴 Меньше размытие для недоступных
      : 'blur(252px)', // ⚪ СИЛЬНОЕ размытие для стекла
    WebkitBackdropFilter: isStopped
      ? 'blur(8px)'
      : 'blur(25px)',
    opacity: isStopped ? 0.95 : 1, // 🔴 Почти непрозрачные недоступные
    cursor: isStopped ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    border: isStopped 
      ? '2px dashed rgba(244, 67, 54, 0.9)' // 🔴 Яркая красная пунктирная
      : '1px solid rgba(255, 255, 255, 0.9)', // ⚪ Полупрозрачная белая
    transform: 'translateY(0)'
  }}
  onClick={() => !isStopped && addToCart(dish)}
  onMouseEnter={(e) => {
    if (!isStopped) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 1.9)';
    }
  }}
  onMouseLeave={(e) => {
    if (!isStopped) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.35)';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
    }
  }}
>
  <h3 style={{ 
    margin: '0 0 8px 0', 
    fontSize: '16px', 
    color: isStopped ? '#fff' : '#1a1a1a', // 🔴 Белый текст для недоступных
    lineHeight: '1.3',
    textShadow: isStopped ? '0 2px 4px rgba(0,0,0,0.6)' : '0 1px 2px rgba(255,255,255,0.8)'
  }}>
    {dish.name}
  </h3>
  <p style={{ 
    color: isStopped ? 'rgba(255,255,255,0.9)' : '#555', 
    margin: '0 0 12px 0', 
    fontSize: '13px',
    textShadow: isStopped ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
  }}>
    {dish.category || 'Без категории'}
  </p>
  <p style={{ 
    fontWeight: 'bold', 
    color: isStopped ? '#ffcdd2' : '#2e7d32', // 🔴 Светло-красная цена для недоступных
    margin: '0', 
    fontSize: '18px',
    textShadow: isStopped ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
  }}>
    {dish.price ? `${dish.price} ₽` : 'Цена не указана'}
  </p>
  {isStopped && (
    <div style={{ 
      marginTop: '12px', 
      padding: '8px', 
      background: 'rgba(183, 28, 28, 0.6)', // 🔴 Тёмно-красный фон
      borderRadius: '6px', 
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.3)'
    }}>
      <span style={{ 
        color: '#fff', 
        fontSize: '14px', 
        fontWeight: 'bold',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
      }}>
         Недоступно
      </span>
    </div>
  )}
</div>
              );
            })}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: КОРЗИНА */}
        <div style={{ 
          width: '360px', 
          backgroundColor: 'rgba(255, 255, 255, 1)', // Почти непрозрачная
          padding: '25px', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)', // Сильное размытие
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          <h2 style={{ marginBottom: '25px', color: '#1a1a1a', borderBottom: '2px solid rgba(76, 175, 80, 0.6)', paddingBottom: '15px', fontSize: '22px',textShadow: '0 1px 2px' }}>
            🛒 Новый заказ
          </h2>

          {/* Выбор стола */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444', fontSize: '14px' }}>
              Номер стола:
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '2px solid #ddd',
                fontSize: '15px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Выберите стол</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Стол №{num}</option>
              ))}
            </select>
          </div>

          {/* Корзина */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}>🛒</div>
                <p>Корзина пуста</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.dishId} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px', 
                  marginBottom: '10px',
                  background: 'rgba(255, 255, 255, 1)',
                  borderRadius: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', color: '#333' }}>{item.dishName}</p>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                      {item.quantity} × {item.price} ₽
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => removeFromCart(item.dishId)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>−</button>
                    <span style={{ fontWeight: 'bold', minWidth: '25px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => addToCart(dishes.find(d => d.id === item.dishId))} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#4CAF50', color: 'white', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Итого */}
          <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
              <span>Итого:</span>
              <span style={{ color: '#4CAF50' }}>{cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)} ₽</span>
            </div>
            <button
              onClick={handleSubmitOrder}
              disabled={submitting || !selectedTable || cart.length === 0}
              style={{
                width: '100%',
                padding: '16px',
                background: (!selectedTable || cart.length === 0) ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '17px',
                fontWeight: 'bold',
                cursor: (!selectedTable || cart.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? '⏳ Создание...' : '✅ Создать заказ'}
            </button>
            {message && (
              <div style={{ marginTop: '15px', padding: '12px', borderRadius: '8px', textAlign: 'center', background: message.includes('Ошибка') ? '#ffebee' : '#e8f5e9', color: message.includes('Ошибка') ? '#c62828' : '#2e7d32' }}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;