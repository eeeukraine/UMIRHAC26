import React, { useState } from 'react'
import './RefreshButton.css'

const RefreshButton = ({ onRefresh, label = 'Обновить данные' }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onRefresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      className={`refresh-btn ${isLoading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={isLoading}
      title={label}
    >
      <svg 
        className={`refresh-icon ${isLoading ? 'spinning' : ''}`}
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
      <span className="refresh-text">{isLoading ? 'Обновление...' : label}</span>
    </button>
  )
}

export default RefreshButton