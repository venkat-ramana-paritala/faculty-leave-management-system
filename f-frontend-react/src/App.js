import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import FacultyDashboard from './pages/FacultyDashboard';
import HodDashboard from './pages/HodDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import './index.css';

function App() {
  const [role, setRole] = useState(null);

  function handleLogin(userRole) {
    setRole(userRole);
  }

  function handleLogout() {
    setRole(null);
  }

  return (
    <>
      {!role && <LoginPage onLogin={handleLogin} />}
      {role === 'FACULTY' && <FacultyDashboard onLogout={handleLogout} />}
      {role === 'HOD' && <HodDashboard onLogout={handleLogout} />}
      {role === 'PRINCIPAL' && <PrincipalDashboard onLogout={handleLogout} />}
      {role === 'admin' && <AdminDashboard onLogout={handleLogout} />}
    </>
  );
}

export default App;
