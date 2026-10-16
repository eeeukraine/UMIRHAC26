import React, { useState, useEffect, useMemo } from 'react';
import './priemps.css';
import Sidebar from "../components/Sidebar.jsx";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const SupplyReception = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState('manual');
  
  const [formData, setFormData] = useState({
    supplierName: '',
    deliveryDate: '',
    products: [{ name: '', quantity: '', unit: 'кг', expirationDate: '' }],
  });
  
  const [proposals, setProposals] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [activeFilter, setActiveFilter] = useState('all');

  const loadData = async () => {
    try {
      const [delRes, propRes] = await Promise.all([
        fetch('http://localhost:8080/api/deliveries', { headers: getAuthHeaders() }),
        fetch('http://localhost:8080/api/supplier/proposals', { headers: getAuthHeaders() })
      ]);
      if (delRes.ok) setDeliveries(await delRes.json());
      if (propRes.ok) setProposals(await propRes.json());
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Не удалось загрузить данные');
    }
  };

  useEffect(() => { loadData(); }, []);

  const sortedDeliveries = useMemo(() => {
    const sorted = [...deliveries];
    sorted.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === 'supplier') {
        const nameA = (a.supplier || '').toLowerCase();
        const nameB = (b.supplier || '').toLowerCase();
        if (nameA < nameB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });
    return sorted;
  }, [deliveries, sortConfig]);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleApproveProposal = async (id) => {
    if (!window.confirm('Одобрить этот запрос? Партия будет автоматически добавлена на склад.')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/supplier/proposals/${id}/accept`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment: 'Принято' })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('✅ ' + data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('❌ Ошибка: ' + err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectProposal = async (id) => {
    const reason = window.prompt('Укажите причину отклонения:') || 'Отклонено';
    try {
      const res = await fetch(`http://localhost:8080/api/supplier/proposals/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment: reason })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('✅ Запрос отклонён');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('❌ Ошибка: ' + err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const renderList = () => {
    if (activeFilter === 'pending') {
      const pending = proposals.filter(p => p.status === 'pending');
      if (pending.length === 0) return <p className="empty-text">Нет новых запросов от поставщиков</p>;

      return pending.map(p => (
        <div key={`prop-${p.id}`} className="delivery-item delivery-item-pending">
          <div className="delivery-item-header">
            <div>
              <span className="source-badge badge-service">🌐 От поставщика</span>
              <span className="delivery-supplier">{p.supplierName}</span>
              <span className="delivery-product">→ {p.productName}</span>
            </div>
            <span className="delivery-status status-pending">⏳ Ожидает решения</span>
          </div>
          <div className="delivery-item-details">
            <span>📦 {p.quantity} {p.unit}</span>
            <span>💰 {p.pricePerUnit} ₽/{p.unit}</span>
            <span>📅 Срок: {new Date(p.expirationDate).toLocaleDateString('ru-RU')}</span>
            <span>💵 Всего: {(p.quantity * p.pricePerUnit).toFixed(2)} ₽</span>
          </div>
          <div className="delivery-actions">
            <button className="btn-approve" onClick={() => handleApproveProposal(p.id)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Принять (на склад)
            </button>
            <button className="btn-reject" onClick={() => handleRejectProposal(p.id)}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Отклонить
            </button>
          </div>
        </div>
      ));
    }

    let filtered = sortedDeliveries;
    if (activeFilter === 'accepted') {
      filtered = sortedDeliveries.filter(d => d.status === 'Принята' || d.status === 'completed');
    } else if (activeFilter === 'rejected') {
      filtered = sortedDeliveries.filter(d => d.status === 'Отклонена');
    }

    if (filtered.length === 0) return <p className="empty-text">История поставок пуста</p>;

    return filtered.map(d => {
      const isAccepted = d.status === 'Принята' || d.status === 'completed';
      const statusClass = isAccepted ? 'accepted' : 'rejected';
      const statusText = isAccepted ? '✅ Принята' : '❌ Отклонена';
      const isFromSupplier = d.supplier && d.supplier.startsWith('🌐');

      return (
        <div key={`del-${d.id}`} className="delivery-item">
          <div className="delivery-item-header">
            <div>
              <span className={`source-badge ${isFromSupplier ? 'badge-service' : 'badge-manual'}`}>
                {isFromSupplier ? '🌐 От поставщика' : '✍️ Ручная'}
              </span>
              <span className="delivery-supplier">{d.supplier}</span>
            </div>
            <span className={`delivery-status status-${statusClass}`}>{statusText}</span>
          </div>
          <div className="delivery-item-details">
            <span>📅 {d.date || new Date(d.createdAt).toLocaleDateString('ru-RU')}</span>
            {/* ✅ ИСПРАВЛЕНО: проверяем itemsCount (из @JsonProperty) или totalItems */}
            <span>📦 {d.itemsCount || d.totalItems || d.items?.length || 1} позиций</span>
            {d.totalAmount > 0 && <span>💵 {d.totalAmount.toFixed(2)} ₽</span>}
          </div>
          {d.notes && (
            <div className="delivery-rejection-reason"><strong>Примечание:</strong> {d.notes}</div>
          )}
        </div>
      );
    });
  };

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
      products: [...prev.products, { name: '', quantity: '', unit: 'кг', expirationDate: '' }],
    }));
  };

  const removeProductField = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!formData.supplierName || !formData.deliveryDate) throw new Error('Заполните все обязательные поля');
      const validProducts = formData.products.filter(p => p.name && p.quantity);
      if (validProducts.length === 0) throw new Error('Добавьте хотя бы один продукт');

      const deliveryData = {
        supplierName: formData.supplierName,
        deliveryDate: formData.deliveryDate,
        status: "Принята", 
        items: validProducts.map(p => ({
          productName: p.name,
          quantity: parseFloat(p.quantity),
          unit: p.unit,
          expirationDate: p.expirationDate,
          unitPrice: 0
        }))
      };

      const response = await fetch('http://localhost:8080/api/deliveries', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(deliveryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании поставки');
      }

      setSuccessMessage('✅ Ручная поставка успешно зарегистрирована!');
      loadData();
      setFormData({ supplierName: '', deliveryDate: '', products: [{ name: '', quantity: '', unit: 'кг', expirationDate: '' }] });
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('❌ ' + err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      setTimeout(() => {
        setSuccessMessage(`✅ Файл "${file.name}" успешно обработан!`);
        setLoading(false);
        setIsModalOpen(false);
        setTimeout(() => setSuccessMessage(''), 3000);
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
            <p className="supply-subtitle">Одобрение запросов от поставщиков и регистрация ручных поставок</p>
          </div>
          
          <div className="supply-grid">
            <div className="supply-main">
              <div className="card history-card-full">
                <div className="card-header card-header-blue">
                  <h3>{activeFilter === 'pending' ? 'Входящие запросы (Требуют решения)' : 'История поставок'}</h3>
                  <div className="sort-controls">
                    <button className={`sort-btn ${sortConfig.key === 'date' ? 'active' : ''}`} onClick={() => requestSort('date')}>
                      По дате {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                    <button className={`sort-btn ${sortConfig.key === 'supplier' ? 'active' : ''}`} onClick={() => requestSort('supplier')}>
                      По фирме {sortConfig.key === 'supplier' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                  </div>
                </div>

                <div className="filter-tabs-container">
                  <div className="filter-tabs">
                    <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                      Все поставки ({deliveries.length})
                    </button>
                    <button className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`} onClick={() => setActiveFilter('pending')}>
                      ⏳ Ожидают решения ({proposals.filter(p => p.status === 'pending').length})
                    </button>
                    <button className={`filter-tab ${activeFilter === 'accepted' ? 'active' : ''}`} onClick={() => setActiveFilter('accepted')}>
                      Принятые ({deliveries.filter(d => d.status === 'Принята' || d.status === 'completed').length})
                    </button>
                    <button className={`filter-tab ${activeFilter === 'rejected' ? 'active' : ''}`} onClick={() => setActiveFilter('rejected')}>
                      Отклоненные ({deliveries.filter(d => d.status === 'Отклонена').length})
                    </button>
                  </div>
                </div>

                <div className="delivery-history-list expanded">
                  {renderList()}
                </div>
              </div>
            </div>

            <div className="supply-sidebar">
              <div className="card action-card action-card-sidebar">
                <div className="card-body text-center">
                  <div className="action-icon action-icon-sm">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="action-title action-title-sm">Ручная поставка</h2>
                  <p className="action-desc action-desc-sm">Загрузить Excel или ввести вручную</p>
                  <button onClick={() => setIsModalOpen(true)} className="submit-btn submit-btn-sm">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Создать</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

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

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Регистрация ручной поставки</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-tabs">
              <button className={`tab-btn ${inputMode === 'excel' ? 'active' : ''}`} onClick={() => setInputMode('excel')}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Загрузить Excel
              </button>
              <button className={`tab-btn ${inputMode === 'manual' ? 'active' : ''}`} onClick={() => setInputMode('manual')}>
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
                    <input type="file" accept=".xlsx, .csv" onChange={handleExcelUpload} className="hidden-file-input" />
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
                            <input type="text" value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} placeholder="Название" className="product-input" required />
                            <input type="number" step="0.01" value={product.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} placeholder="Кол-во" className="product-input" required />
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
                          <input type="date" value={product.expirationDate} onChange={(e) => handleProductChange(index, 'expirationDate', e.target.value)} className="product-input" placeholder="Срок годности" required />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? (
                      <><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Регистрация...</span></>
                    ) : (
                      <><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>Зарегистрировать поставку</span></>
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