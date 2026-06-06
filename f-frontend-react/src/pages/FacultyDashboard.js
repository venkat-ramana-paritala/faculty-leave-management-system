import React, { useState } from 'react';
import API from '../api';
import FacultyHome from '../components/faculty/FacultyHome';
import ApplyLeave from '../components/faculty/ApplyLeave';
import LeaveHistory from '../components/faculty/LeaveHistory';
import SubstituteRequests from '../components/faculty/SubstituteRequests';
import FacultyProfile from '../components/faculty/FacultyProfile';
import Rules from '../components/faculty/Rules';
import Help from '../components/faculty/Help';
import Almanac from '../components/faculty/Almanac';

function FacultyDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logout() {
    try {
      const response = await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        alert('Logged out successfully');
        onLogout();
      } else {
        alert('Logout failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  function renderContent() {
    if (activePage === 'home') return <FacultyHome />;
    if (activePage === 'apply') return <ApplyLeave />;
    if (activePage === 'substitute') return <SubstituteRequests />;
    if (activePage === 'history') return <LeaveHistory />;
    if (activePage === 'rules') return <Rules />;
    if (activePage === 'almanac') return <Almanac />;
    if (activePage === 'help') return <Help />;
    if (activePage === 'profile') return <FacultyProfile />;
    return <FacultyHome />;
  }

  return (
    <div className="dashboard">
      <div className="top-bar">
        <div className="logo-area">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <h4>Kakatiya Institute Of Technology &amp; Science, Warangal</h4>
        </div>
        <h5>Welcome, Faculty!</h5>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="main-body">
        {/* Overlay backdrop for mobile */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button
            className={activePage === 'home' ? 'active' : ''}
            onClick={() => navigate('home')}
          >
            Home
          </button>
          <button
            className={activePage === 'apply' ? 'active' : ''}
            onClick={() => navigate('apply')}
          >
            Apply Leave
          </button>
          <button
            className={activePage === 'substitute' ? 'active' : ''}
            onClick={() => navigate('substitute')}
          >
            Substitute Requests
          </button>
          <button
            className={activePage === 'history' ? 'active' : ''}
            onClick={() => navigate('history')}
          >
            Leave History
          </button>
          <button
            className={activePage === 'rules' ? 'active' : ''}
            onClick={() => navigate('rules')}
          >
            Rules &amp; Regulations
          </button>
          <button
            className={activePage === 'almanac' ? 'active' : ''}
            onClick={() => navigate('almanac')}
          >
            Almanac
          </button>
          <button
            className={activePage === 'help' ? 'active' : ''}
            onClick={() => navigate('help')}
          >
            HELP
          </button>
          <button
            className={activePage === 'profile' ? 'active' : ''}
            onClick={() => navigate('profile')}
          >
            Profile
          </button>
        </div>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
