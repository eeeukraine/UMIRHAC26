import React, { useState, useEffect } from 'react';
import './priemps.css';
import Sidebar from "../components/Sidebar.jsx";

const SupplyReception = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState('excel'); // 'excel' или 'manual'
  
  const [formData, setFormData] = useState({
    supplierName: '',
    deliveryDate: '',
    products: [{ name: '', quantity: '', unit: 'шт', expirationDate: '' }],
  });
  
  const [deliveries, setDeliveries] = useState([]);
  const [stopList, setStopList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const loadExistingData = async () => {
    try {
      // Демо-данные: теперь это история поставок, а не просто продукты
      setDeliveries([
        { id: 1, supplier: 'ООО «ФудСервис»', date: '2024-01-15', itemsCount: 12, status: 'Принята' },
        { id: 2, supplier: 'Мясной двор', date: '2024-01-14', itemsCount: 8, status: 'Принята' },
        { id: 3, supplier: 'Овощи+', date: '2024-01-13', itemsCount: 15, status: 'Принята' },
      ]);
    } catch (err) {
      setError('Ошибка загрузки данных');
    }
  };

  useEffect(() => {
    loadExistingData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setFormData(prev => ({ ...prev, products: updatedProducts }));
  };

  const addProductField = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { name: '', quantity: '', unit: 'шт', expirationDate: '' }],
    }));
  };

  const removeProductField = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const checkAndUpdateStopList = (newProducts) => {
    return stopList.filter(stopItem => {
      const hasNewSupply = newProducts.some(p => p.name.toLowerCase() === stopItem.name.toLowerCase());
      return !hasNewSupply;
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!formData.supplierName || !formData.deliveryDate) {
        throw new Error('Заполните все обязательные поля');
      }

      const validProducts = formData.products.filter(p => p.name && p.quantity);
      if (validProducts.length === 0) {
        throw new Error('Добавьте хотя бы один продукт');
      }

      const newProducts = validProducts.map(p => ({
        id: Date.now() + Math.random(),
        name: p.name,
        quantity: parseFloat(p.quantity),
        unit: p.unit,
        lastUpdated: formData.deliveryDate,
        expirationDate: p.expirationDate,
      }));

      // Создаем новую запись поставки
      const newDelivery = {
        id: Date.now(),
        supplier: formData.supplierName,
        date: formData.deliveryDate,
        itemsCount: validProducts.length,
        status: 'Принята'
      };

      setDeliveries(prev => [newDelivery, ...prev]);
      setStopList(checkAndUpdateStopList(newProducts));
      setSuccessMessage('Поставка успешно зарегистрирована!');
      
      // Сброс формы и закрытие модалки
      setFormData({
        supplierName: '',
        deliveryDate: '',
        products: [{ name: '', quantity: '', unit: 'шт', expirationDate: '' }],
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Ошибка при регистрации поставки');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      // Имитация обработки Excel файла
      setTimeout(() => {
        const newDelivery = {
          id: Date.now(),
          supplier: 'Импорт из Excel',
          date: new Date().toISOString().split('T')[0],
          itemsCount: Math.floor(Math.random() * 20) + 5,
          status: 'Принята'
        };
        setDeliveries(prev => [newDelivery, ...prev]);
        setSuccessMessage(`Файл "${file.name}" успешно обработан!`);
        setLoading(false);
        setIsModalOpen(false);
      }, 1500);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />

      <main className="supply-content">
        <div className="supply-container">
          <div className="supply-header">
            <h1 className="supply-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Управление поставками
            </h1>
            <p className="supply-subtitle">Регистрация новых поставок и просмотр истории</p>
          </div>

          <div className="supply-grid">
            <div className="supply-main">
              {/* Главная карточка с кнопкой действия */}
              <div className="card action-card">
                <div className="card-body text-center">
                  <div className="action-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="action-title">Регистрация новой поставки</h2>
                  <p className="action-desc">Загрузите данные из Excel-файла или введите информацию о поставке вручную</p>
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="submit-btn"
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Новая поставка</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="supply-sidebar">
              <div className="card">
                <div className="card-header card-header-green">
                  <h3>Статистика</h3>
                </div>
                <div className="card-body">
                  <div className="stats-row">
                    <span className="stats-label">Всего поставок</span>
                    <span className="stats-value">{deliveries.length}</span>
                  </div>
                  <div className="stats-row">
                    <span className="stats-label">В стоп-листе</span>
                    <span className="stats-value danger">{stopList.length}</span>
                  </div>
                </div>
              </div>

              {/* История поставок (вместо последних продуктов) */}
              <div className="card">
                <div className="card-header card-header-purple">
                  <h3>История поставок</h3>
                </div>
                <div className="delivery-history-list">
                  {deliveries.length > 0 ? (
                    deliveries.map(delivery => (
                      <div key={delivery.id} className="delivery-item">
                        <div className="delivery-item-header">
                          <span className="delivery-supplier">{delivery.supplier}</span>
                          <span className="delivery-status">{delivery.status}</span>
                        </div>
                        <div className="delivery-item-details">
                          <span>{delivery.date}</span>
                          <span>{delivery.itemsCount} позиций</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">Поставок пока нет</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Уведомления */}
          {successMessage && (
            <div className="notification success">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="notification error">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </main>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Регистрация поставки</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-tabs">
              <button 
                className={`tab-btn ${inputMode === 'excel' ? 'active' : ''}`}
                onClick={() => setInputMode('excel')}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Загрузить Excel
              </button>
              <button 
                className={`tab-btn ${inputMode === 'manual' ? 'active' : ''}`}
                onClick={() => setInputMode('manual')}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Ввести вручную
              </button>
            </div>

            <div className="modal-body">
              {inputMode === 'excel' ? (
                <div className="excel-dropzone">
                  <svg className="dropzone-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3>Перетащите файл Excel сюда</h3>
                  <p>или нажмите для выбора файла (.xlsx, .csv)</p>
                  <label className="file-input-label">
                    Выбрать файл
                    <input 
                      type="file" 
                      accept=".xlsx, .csv" 
                      onChange={handleExcelUpload} 
                      className="hidden-file-input" 
                    />
                  </label>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="supply-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Поставщик *</label>
                      <input type="text" name="supplierName" value={formData.supplierName} onChange={handleInputChange} placeholder="Название поставщика" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Дата поставки *</label>
                      <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} className="form-input" required />
                    </div>
                  </div>

                  <div className="products-section">
                    <div className="products-header">
                      <label className="form-label">Продукты *</label>
                      <button type="button" onClick={addProductField} className="add-product-btn">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Добавить продукт
                      </button>
                    </div>

                    <div className="products-list-modal">
                      {formData.products.map((product, index) => (
                        <div key={index} className="product-item">
                          <div className="product-grid">
                            <input type="text" value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} placeholder="Название" className="product-input" />
                            <input type="number" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} placeholder="Кол-во" className="product-input" />
                            <div className="product-actions">
                              <select value={product.unit} onChange={(e) => handleProductChange(index, 'unit', e.target.value)} className="form-select">
                                <option value="шт">шт</option>
                                <option value="кг">кг</option>
                                <option value="л">л</option>
                                <option value="уп">уп</option>
                              </select>
                              {formData.products.length > 1 && (
                                <button type="button" onClick={() => removeProductField(index)} className="remove-btn">
                                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          <input type="date" value={product.expirationDate} onChange={(e) => handleProductChange(index, 'expirationDate', e.target.value)} className="product-input" placeholder="Срок годности" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? (
                      <>
                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Регистрация...</span>
                      </>
                    ) : (
                      <>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Зарегистрировать поставку</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyReception;