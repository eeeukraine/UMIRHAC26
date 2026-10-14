import React, { useState } from 'react';
import Login from './pages/Login';
import NewOrder from './pages/NewOrder';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return <NewOrder />;
}

export default App;