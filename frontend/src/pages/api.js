const API_BASE_URL = 'http://localhost:8080/api';

// 🌟 Вспомогательная функция: добавляет токен авторизации ко всем запросам
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Получить все блюда С ИНГРЕДИЕНТАМИ
export const fetchDishes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dishes/with-ingredients`, {
      headers: getAuthHeaders() // 👈 Добавлены заголовки с токеном
    });
    if (!response.ok) throw new Error('Ошибка загрузки блюд');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при загрузке блюд:', error);
    return [];
  }
};

// Получить все категории
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders() // 👈 Добавлены заголовки с токеном
    });
    if (!response.ok) throw new Error('Ошибка загрузки категорий');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
    return [];
  }
};

// Добавить новое блюдо
export const createDish = async (dish) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dishes`, {
      method: 'POST',
      headers: getAuthHeaders(), // 👈 getAuthHeaders уже включает Content-Type и Authorization
      body: JSON.stringify(dish)
    });
    if (!response.ok) throw new Error('Ошибка создания блюда');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при создании блюда:', error);
    return null;
  }
};

// 🌟 Если у тебя есть другие функции в этом файле (например, для склада или поставок),
// просто добавь к ним `, { headers: getAuthHeaders() }` по аналогии!