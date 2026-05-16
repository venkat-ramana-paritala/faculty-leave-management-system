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
      <div style={{ background: '#f59e0b', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', borderBottom: '1px solid #d97706' }}>
        🧪 TEST ACCESS (Bypass Login): 
        <button onClick={() => setRole('FACULTY')} style={{margin: '0 5px', padding: '2px 6px', cursor: 'pointer'}}>Faculty</button>
        <button onClick={() => setRole('HOD')} style={{margin: '0 5px', padding: '2px 6px', cursor: 'pointer'}}>HOD</button>
        <button onClick={() => setRole('PRINCIPAL')} style={{margin: '0 5px', padding: '2px 6px', cursor: 'pointer'}}>Principal</button>
        <button onClick={() => setRole('admin')} style={{margin: '0 5px', padding: '2px 6px', cursor: 'pointer'}}>Admin</button>
        <button onClick={() => setRole(null)} style={{margin: '0 5px', padding: '2px 6px', cursor: 'pointer'}}>Reset to Login</button>
      </div>

      {!role && <LoginPage onLogin={handleLogin} />}
      {role === 'FACULTY' && <FacultyDashboard onLogout={handleLogout} />}
      {role === 'HOD' && <HodDashboard onLogout={handleLogout} />}
      {role === 'PRINCIPAL' && <PrincipalDashboard onLogout={handleLogout} />}
      {role === 'admin' && <AdminDashboard onLogout={handleLogout} />}
    </>
  );
}

export default App;
