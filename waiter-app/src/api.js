const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Получить все блюда с ингредиентами
export const fetchDishes = async () => {
  const response = await fetch(`${API_BASE_URL}/dishes/with-ingredients`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Ошибка загрузки блюд');
  return await response.json();
};

// Получить стоп-лист
export const fetchStopList = async () => {
  const response = await fetch(`${API_BASE_URL}/stop-list`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Ошибка загрузки стоп-листа');
  return await response.json();
};

// Создать заказ (со списанием ингредиентов)
export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData)
  });
  if (!response.ok) throw new Error('Ошибка создания заказа');
  return await response.json();
};