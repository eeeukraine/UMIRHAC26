import React, { useState, useEffect } from 'react'
import './supplier-keys.css'
import Sidebar from "../components/Sidebar.jsx"

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const SupplierApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([])
  const [proposals, setProposals] = useState([])
  const [newSupplierName, setNewSupplierName] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('keys') // 'keys' или 'proposals'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const headers = getAuthHeaders()
      
      const [keysRes, proposalsRes] = await Promise.all([
        fetch('http://localhost:8080/api/supplier/api-keys', { headers }),
        fetch('http://localhost:8080/api/supplier/proposals', { headers })
      ])
      
      const keysData = await keysRes.json()
      const proposalsData = await proposalsRes.json()
      
      setApiKeys(keysData)
      setProposals(proposalsData)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newSupplierName.trim()) {
      alert('Введите название поставщика')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/supplier/api-keys', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ supplierName: newSupplierName })
      })
      const data = await response.json()
      setApiKeys([...apiKeys, data])
      setNewSupplierName('')
      alert(`API ключ создан для "${data.supplierName}":\n${data.apiKey}`)
    } catch (err) {
      console.error('Ошибка создания ключа:', err)
      alert('Ошибка создания ключа')
    }
  }

  const deactivateKey = async (id) => {
    if (!confirm('Деактивировать этот API ключ?')) return

    try {
      await fetch(`http://localhost:8080/api/supplier/api-keys/${id}/deactivate`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      loadData()
    } catch (err) {
      console.error('Ошибка деактивации:', err)
    }
  }

  const handleProposalAction = async (proposalId, action) => {
    const comment = prompt(action === 'accept' ? 'Комментарий (необязательно):' : 'Причина отклонения:')
    
    try {
      const response = await fetch(`http://localhost:8080/api/supplier/proposals/${proposalId}/${action}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment: comment || '' })
      })
      const data = await response.json()
      
      if (data.success) {
        loadData()
        alert(data.message)
      } else {
        alert('Ошибка: ' + data.message)
      }
    } catch (err) {
      console.error('Ошибка:', err)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="status-badge pending">⏳ Ожидает</span>
      case 'accepted': return <span className="status-badge accepted">✓ Принято</span>
      case 'rejected': return <span className="status-badge rejected">✗ Отклонено</span>
      default: return <span className="status-badge">{status}</span>
    }
  }

  const getPriorityColor = (quantity) => {
    if (quantity >= 100) return 'high'
    if (quantity >= 50) return 'medium'
    return 'low'
  }

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="supply-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка данных...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Сервис поставщиков
            </h1>
            <p className="page-subtitle">
              Управление API ключами и предложениями от поставщиков
            </p>
          </div>

          {/* Переключатель вкладок */}
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'keys' ? 'active' : ''}`}
              onClick={() => setActiveTab('keys')}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              API ключи ({apiKeys.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'proposals' ? 'active' : ''}`}
              onClick={() => setActiveTab('proposals')}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Предложения ({proposals.filter(p => p.status === 'pending').length})
            </button>
          </div>

          {/* Вкладка API ключей */}
          {activeTab === 'keys' && (
            <div className="tab-content">
              {/* Форма создания нового ключа */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                  <h2>Создать новый API ключ</h2>
                </div>
                <div className="card-body">
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Название компании поставщика"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      className="form-input"
                      onKeyPress={(e) => e.key === 'Enter' && createApiKey()}
                    />
                    <button onClick={createApiKey} className="btn-primary">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Создать ключ
                    </button>
                  </div>
                </div>
              </div>

              {/* Список API ключей */}
              <div className="card">
                <div className="card-header">
                  <h2>Активные API ключи ({apiKeys.filter(k => k.active).length})</h2>
                </div>
                <div className="card-body">
                  {apiKeys.length > 0 ? (
                    <div className="api-keys-list">
                      {apiKeys.map(key => (
                        <div key={key.id} className={`api-key-item ${key.active ? 'active' : 'inactive'}`}>
                          <div className="key-info">
                            <h3>{key.supplierName}</h3>
                            <code className="key-value">{key.apiKey}</code>
                            <div className="key-meta">
                              <span>📅 Создан: {new Date(key.createdAt).toLocaleDateString('ru-RU')}</span>
                              {key.lastUsedAt && (
                                <span>🕐 Использован: {new Date(key.lastUsedAt).toLocaleString('ru-RU')}</span>
                              )}
                            </div>
                          </div>
                          <div className="key-actions">
                            <span className={`status-badge ${key.active ? 'active' : 'inactive'}`}>
                              {key.active ? '✓ Активен' : '✗ Деактивирован'}
                            </span>
                            {key.active && (
                              <button 
                                onClick={() => deactivateKey(key.id)}
                                className="btn-danger"
                              >
                                Деактивировать
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>Нет API ключей. Создайте первый ключ для поставщика.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Инструкция */}
              <div className="card info-card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                  <h2>📋 Инструкция для поставщиков</h2>
                </div>
                <div className="card-body">
                  <p>Передайте поставщику его API ключ. Он сможет использовать его для отправки предложений о поставках.</p>
                  <div className="code-block">
                    <h4>Пример запроса от поставщика:</h4>
                    <pre>{`POST http://localhost:8080/api/supplier/propose
Headers:
  X-API-Key: fs-abc123-def456-ghi789
  Content-Type: application/json

Body:
{
  "productName": "Сыр Моцарелла",
  "quantity": 50,
  "unit": "кг",
  "pricePerUnit": 450.00,
  "expirationDate": "2026-11-15"
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Вкладка предложений */}
          {activeTab === 'proposals' && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h2>Предложения от поставщиков</h2>
                </div>
                <div className="card-body">
                  {proposals.length > 0 ? (
                    <div className="proposals-list">
                      {proposals.map(proposal => (
                        <div key={proposal.id} className={`proposal-item ${proposal.status}`}>
                          <div className="proposal-header">
                            <h3>{proposal.productName}</h3>
                            {getStatusBadge(proposal.status)}
                          </div>
                          
                          <div className="proposal-details">
                            <div className="detail-item">
                              <span className="detail-label">Поставщик:</span>
                              <span className="detail-value">{proposal.supplierName}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Количество:</span>
                              <span className="detail-value">{proposal.quantity} {proposal.unit}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Цена за единицу:</span>
                              <span className="detail-value">{proposal.pricePerUnit} ₽</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Общая сумма:</span>
                              <span className="detail-value total">
                                {(proposal.quantity * proposal.pricePerUnit).toFixed(2)} ₽
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Срок годности:</span>
                              <span className="detail-value">
                                {new Date(proposal.expirationDate).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Дата предложения:</span>
                              <span className="detail-value">
                                {new Date(proposal.createdAt).toLocaleString('ru-RU')}
                              </span>
                            </div>
                          </div>

                          {proposal.reviewComment && (
                            <div className="review-comment">
                              <strong>Комментарий:</strong> {proposal.reviewComment}
                            </div>
                          )}

                          {proposal.status === 'pending' && (
                            <div className="proposal-actions">
                              <button 
                                onClick={() => handleProposalAction(proposal.id, 'accept')}
                                className="btn-accept"
                              >
                                ✓ Принять
                              </button>
                              <button 
                                onClick={() => handleProposalAction(proposal.id, 'reject')}
                                className="btn-reject"
                              >
                                 Отклонить
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>Нет предложений от поставщиков</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default SupplierApiKeys