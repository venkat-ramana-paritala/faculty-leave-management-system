import React, { useState } from 'react';
import API from '../api';
import HodHome from '../components/hod/HodHome';
import HodRequests from '../components/hod/HodRequests';
import HodRequestHistory from '../components/hod/HodRequestHistory';
import HodProfile from '../components/hod/HodProfile';
import Rules from '../components/faculty/Rules';
import Help from '../components/faculty/Help';
import Almanac from '../components/faculty/Almanac';

function HodDashboard({ onLogout }) {
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
    if (activePage === 'home') return <HodHome />;
    if (activePage === 'requests') return <HodRequests />;
    if (activePage === 'history') return <HodRequestHistory />;
    if (activePage === 'rules') return <Rules />;
    if (activePage === 'almanac') return <Almanac />;
    if (activePage === 'help') return <Help />;
    if (activePage === 'profile') return <HodProfile />;
    return <HodHome />;
  }

  return (
    <div className="dashboard">
      <div className="top-bar hod">
        <div className="logo-area">
          <h4>Kakatiya Institute Of Technology &amp; Science, Warangal</h4>
        </div>
        <h5>Welcome, HOD!</h5>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="main-body">
        <div className="sidebar hod">
          <button
            className={activePage === 'home' ? 'active' : ''}
            onClick={() => setActivePage('home')}
          >
            Home
          </button>
          <button
            className={activePage === 'requests' ? 'active' : ''}
            onClick={() => setActivePage('requests')}
          >
            Requests
          </button>
          <button
            className={activePage === 'history' ? 'active' : ''}
            onClick={() => setActivePage('history')}
          >
            Request History
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

export default HodDashboard;
