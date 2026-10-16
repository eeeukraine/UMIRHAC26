import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8080/api/supplier'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [supplierName, setSupplierName] = useState('')
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Форма нового предложения
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    unit: 'кг',
    pricePerUnit: '',
    expirationDate: ''
  })

  // Проверяем сохранённый ключ при загрузке
  useEffect(() => {
    const savedKey = localStorage.getItem('supplierApiKey')
    if (savedKey) {
      setApiKey(savedKey)
      validateKey(savedKey)
    }
  }, [])

  // Проверка API ключа
  const validateKey = async (key) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/my-proposals`, {
        headers: { 'X-API-Key': key }
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setProposals(data)
        // Извлекаем имя поставщика из первого предложения
        if (data.length > 0) {
          setSupplierName(data[0].supplierName)
        }
      } else {
        setMessage('❌ Недействительный API ключ')
        setIsAuthenticated(false)
      }
    } catch (err) {
      setMessage('❌ Ошибка подключения к серверу')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Вход по ключу
  const handleLogin = (e) => {
    e.preventDefault()
    if (!apiKey.trim()) {
      setMessage('Введите API ключ')
      return
    }
    localStorage.setItem('supplierApiKey', apiKey)
    validateKey(apiKey)
  }

  // Выход
  const handleLogout = () => {
    localStorage.removeItem('supplierApiKey')
    setApiKey('')
    setIsAuthenticated(false)
    setProposals([])
    setSupplierName('')
    setMessage('')
  }

  // Отправка предложения
  const handleSubmitProposal = async (e) => {
    e.preventDefault()
    
    if (!formData.productName || !formData.quantity || !formData.pricePerUnit || !formData.expirationDate) {
      setMessage('⚠️ Заполните все поля')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/propose`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName: formData.productName,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          pricePerUnit: parseFloat(formData.pricePerUnit),
          expirationDate: formData.expirationDate
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('✅ Предложение отправлено на рассмотрение!')
        setFormData({
          productName: '',
          quantity: '',
          unit: 'кг',
          pricePerUnit: '',
          expirationDate: ''
        })
        // Обновляем список
        const proposalsRes = await fetch(`${API_BASE}/my-proposals`, {
          headers: { 'X-API-Key': apiKey }
        })
        setProposals(await proposalsRes.json())
      } else {
        setMessage('❌ ' + data.message)
      }
    } catch (err) {
      setMessage('❌ Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  // Получение статуса
  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending': return { label: '⏳ На рассмотрении', class: 'status-pending' }
      case 'accepted': return { label: '✅ Принято', class: 'status-accepted' }
      case 'rejected': return { label: ' Отклонено', class: 'status-rejected' }
      default: return { label: status, class: '' }
    }
  }

  // ===== ЭКРАН ВХОДА =====
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🚚 Портал поставщика</h1>
            <p>Введите ваш API ключ для доступа к системе</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>API ключ</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Например: fs-abc123-def456-ghi789"
                className="input-field"
              />
            </div>
            
            {message && <div className="message error">{message}</div>}
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Проверка...' : 'Войти'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Нет API ключа? Обратитесь к администратору системы</p>
          </div>
        </div>
      </div>
    )
  }

  // ===== ГЛАВНЫЙ ЭКРАН =====
  return (
    <div className="app-container">
      {/* Шапка */}
      <header className="app-header">
        <div className="header-content">
          <h1>🚚 Портал поставщика</h1>
          <div className="header-info">
            <span className="supplier-name">👤 {supplierName}</span>
            <button onClick={handleLogout} className="btn-logout">Выйти</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
            <button onClick={() => setMessage('')} className="close-msg">✕</button>
          </div>
        )}

        <div className="dashboard-grid">
          {/* Форма нового предложения */}
          <section className="card form-card">
            <h2>📦 Новое предложение о поставке</h2>
            <form onSubmit={handleSubmitProposal} className="proposal-form">
              <div className="form-group">
                <label>Название продукта *</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  placeholder="Например: Сыр Моцарелла"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Количество *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="50"
                    className="input-field"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Единица измерения</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="input-field"
                  >
                    <option value="кг">кг</option>
                    <option value="л">л</option>
                    <option value="шт">шт</option>
                    <option value="уп">уп</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Цена за единицу (₽) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                  placeholder="450.00"
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label>Срок годности *</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Отправка...' : '📤 Отправить предложение'}
              </button>
            </form>
          </section>

          {/* Список предложений */}
          <section className="card proposals-card">
            <h2>📋 Мои предложения ({proposals.length})</h2>
            
            {proposals.length === 0 ? (
              <div className="empty-state">
                <p>У вас пока нет предложений</p>
              </div>
            ) : (
              <div className="proposals-list">
                {proposals.map(proposal => {
                  const statusInfo = getStatusInfo(proposal.status)
                  return (
                    <div key={proposal.id} className={`proposal-item ${proposal.status}`}>
                      <div className="proposal-top">
                        <h3>{proposal.productName}</h3>
                        <span className={`status-badge ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="proposal-info">
                        <div className="info-row">
                          <span>Количество:</span>
                          <strong>{proposal.quantity} {proposal.unit}</strong>
                        </div>
                        <div className="info-row">
                          <span>Цена за единицу:</span>
                          <strong>{proposal.pricePerUnit} ₽</strong>
                        </div>
                        <div className="info-row total">
                          <span>Общая сумма:</span>
                          <strong>{(proposal.quantity * proposal.pricePerUnit).toFixed(2)} ₽</strong>
                        </div>
                        <div className="info-row">
                          <span>Срок годности:</span>
                          <strong>{new Date(proposal.expirationDate).toLocaleDateString('ru-RU')}</strong>
                        </div>
                        <div className="info-row">
                          <span>Дата отправки:</span>
                          <strong>{new Date(proposal.createdAt).toLocaleString('ru-RU')}</strong>
                        </div>
                      </div>

                      {proposal.reviewComment && (
                        <div className="review-comment">
                          <strong>Комментарий администратора:</strong>
                          <p>{proposal.reviewComment}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App