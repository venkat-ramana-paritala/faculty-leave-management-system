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
          <h4>Kakatiya Institute Of Technology &amp; Science, Warangal</h4>
        </div>
        <h5>Welcome, Faculty!</h5>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="main-body">
        <div className="sidebar">
          <button
            className={activePage === 'home' ? 'active' : ''}
            onClick={() => setActivePage('home')}
          >
            Home
          </button>
          <button
            className={activePage === 'apply' ? 'active' : ''}
            onClick={() => setActivePage('apply')}
          >
            Apply Leave
          </button>
          <button
            className={activePage === 'substitute' ? 'active' : ''}
            onClick={() => setActivePage('substitute')}
          >
            Substitute Requests
          </button>
          <button
            className={activePage === 'history' ? 'active' : ''}
            onClick={() => setActivePage('history')}
          >
            Leave History
          </button>
          <button
            className={activePage === 'rules' ? 'active' : ''}
            onClick={() => setActivePage('rules')}
          >
            Rules &amp; Regulations
          </button>
          <button
            className={activePage === 'almanac' ? 'active' : ''}
            onClick={() => setActivePage('almanac')}
          >
            Almanac
          </button>
          <button
            className={activePage === 'help' ? 'active' : ''}
            onClick={() => setActivePage('help')}
          >
            HELP
          </button>
          <button
            className={activePage === 'profile' ? 'active' : ''}
            onClick={() => setActivePage('profile')}
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
