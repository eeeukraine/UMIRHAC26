const API_BASE_URL = 'http://localhost:8080/api';

// Получить все блюда
export const fetchDishes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dishes`);
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
    const response = await fetch(`${API_BASE_URL}/categories`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dish)
    });
    if (!response.ok) throw new Error('Ошибка создания блюда');
    return await response.json();
  } catch (error) {
    console.error('Ошибка при создании блюда:', error);
    return null;
  }
};