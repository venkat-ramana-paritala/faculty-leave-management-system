import React, { useState } from 'react';
import API from '../api';
import PrincipalHome from '../components/principal/PrincipalHome';
import PrincipalRequests from '../components/principal/PrincipalRequests';
import PrincipalRequestHistory from '../components/principal/PrincipalRequestHistory';
import PrincipalProfile from '../components/principal/PrincipalProfile';

function PrincipalDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    onLogout();
  }

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  function renderPage() {
    switch (activePage) {
      case 'home':    return <PrincipalHome />;
      case 'pending': return <PrincipalRequests />;
      case 'history': return <PrincipalRequestHistory />;
      case 'profile': return <PrincipalProfile />;
      default:        return <PrincipalHome />;
    }
  }

  const navItems = [
    { key: 'home',    label: 'Home' },
    { key: 'pending', label: 'Pending Requests' },
    { key: 'history', label: 'Request History' },
    { key: 'profile', label: 'Profile' },
  ];

  return (
    <div className="dashboard">
      {/* Top bar */}
      <div className="top-bar" style={{ backgroundColor: '#1e3a8a' }}>
        <div className="logo-area">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <h4>Kakatiya Institute Of Technology &amp; Science, Warangal</h4>
        </div>
        <h5>Welcome, Principal!</h5>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main body = sidebar + content */}
      <div className="main-body">
        {/* Overlay backdrop for mobile */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ backgroundColor: '#1e3a8a' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              className={activePage === item.key ? 'active' : ''}
              onClick={() => navigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="content-area">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default PrincipalDashboard;
