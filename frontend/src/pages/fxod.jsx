import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './fxod.css'

const Fxod = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.username || !formData.password) {
        throw new Error('Заполните все поля')
      }

      // === ВРЕМЕННЫЙ МОК ДЛЯ РАЗРАБОТКИ (РАБОТАЕТ БЕЗ БЕКА) ===
      if (import.meta.env.DEV) {
        // Имитируем задержку сети для реалистичности (0.8 сек)
        await new Promise(resolve => setTimeout(resolve, 800))

        if (formData.username === 'admin' && formData.password === '12345') {
          localStorage.setItem('token', 'dev-token-admin')
          localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Администратор', role: 'admin', firmId: 1 }))
          navigate('/dashboard')
          return
        }
        if (formData.username === 'manager' && formData.password === '12345') {
          localStorage.setItem('token', 'dev-token-manager')
          localStorage.setItem('user', JSON.stringify({ id: 2, name: 'Менеджер', role: 'manager', firmId: 1 }))
          navigate('/dashboard')
          return
        }
        if (formData.username === 'worker' && formData.password === '12345') {
          localStorage.setItem('token', 'dev-token-worker')
          localStorage.setItem('user', JSON.stringify({ id: 3, name: 'Сотрудник', role: 'worker', firmId: 1 }))
          navigate('/dashboard')
          return
        }
        
        throw new Error('Неверный логин или пароль. Используйте: admin / 12345')
      }
      // === КОНЕЦ МОКА ===

      // Реальный запрос к бэкенду (сработает, когда друг запустит сервер)
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Неверный логин или пароль')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user)) // Убедись, что бек отдает role и firmId
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUser', formData.username)
      }

      navigate('/dashboard')
      
    } catch (err) {
      setError(err.message || 'Ошибка соединения с сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Декоративные фоновые элементы */}
      <div className="bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="login-container">
        {/* Левая часть — брендинг */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <div className="logo-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h1 className="brand-name">Restock</h1>
            </div>
            
            <h2 className="brand-title">
              Система управления складом ресторана
            </h2>
            
            <p className="brand-description">
              Контролируйте остатки, сроки годности и заказы в одном месте. 
              Автоматическое списание, FIFO и умные рекомендации.
            </p>

            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Автоматическое списание по FIFO</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Контроль сроков годности</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span>Умная аналитика и прогнозы</span>
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть — форма входа */}
        <div className="login-form-wrapper">
          <div className="login-form-card">
            <div className="form-header">
              <h2 className="form-title">Добро пожаловать!</h2>
              <p className="form-subtitle">Войдите в свой аккаунт для продолжения</p>
            </div>

            {error && (
              <div className="error-message">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="username">
                  Логин
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="admin"
                    className="form-input"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Пароль
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">Запомнить меня</span>
                </label>
                <a href="#" className="forgot-link">Забыли пароль?</a>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Вход...</span>
                  </>
                ) : (
                  <>
                    <span>Войти в систему</span>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>Демо-доступ: <strong>admin</strong> / <strong>12345</strong></p>
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                Также: <strong>manager</strong> / <strong>12345</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Fxod