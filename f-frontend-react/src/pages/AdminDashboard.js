import React, { useState } from 'react';
import API from '../api';
import AdminFaculty from '../components/admin/AdminFaculty';
import AdminCreateFaculty from '../components/admin/AdminCreateFaculty';
import AdminHOD from '../components/admin/AdminHOD';
import AdminCreateHOD from '../components/admin/AdminCreateHOD';
import AdminLeaves from '../components/admin/AdminLeaves';
import AdminProfile from '../components/admin/AdminProfile';
import AdminDepartments from '../components/admin/AdminDepartments';
import AdminOfflineLeave from '../components/admin/AdminOfflineLeave';

function AdminDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('faculty');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logout() {
    try {
      const response = await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        alert('Logged out');
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
    if (activePage === 'faculty') return <AdminFaculty />;
    if (activePage === 'createFaculty') return <AdminCreateFaculty onDone={() => setActivePage('faculty')} />;
    if (activePage === 'hod') return <AdminHOD />;
    if (activePage === 'createHOD') return <AdminCreateHOD onDone={() => setActivePage('hod')} />;
    if (activePage === 'leaves') return <AdminLeaves />;
    if (activePage === 'departments') return <AdminDepartments />;
    if (activePage === 'offline') return <AdminOfflineLeave />;
    if (activePage === 'profile') return <AdminProfile />;
    return <AdminFaculty />;
  }

  return (
    <div className="dashboard">
      <div className="top-bar admin">
        <div className="logo-area">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <h4>Kakatiya Institute Of Technology &amp; Science, Warangal</h4>
        </div>
        <h5>Welcome, Admin!</h5>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="main-body">
        {/* Overlay backdrop for mobile */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className={`sidebar admin ${sidebarOpen ? 'open' : ''}`}>
          <button
            className={activePage === 'faculty' ? 'active' : ''}
            onClick={() => navigate('faculty')}
          >
            Faculty
          </button>
          <button
            className={activePage === 'createFaculty' ? 'active' : ''}
            onClick={() => navigate('createFaculty')}
          >
            Create Faculty
          </button>
          <button
            className={activePage === 'hod' ? 'active' : ''}
            onClick={() => navigate('hod')}
          >
            HOD
          </button>
          <button
            className={activePage === 'createHOD' ? 'active' : ''}
            onClick={() => navigate('createHOD')}
          >
            Create HOD
          </button>
          <button
            className={activePage === 'leaves' ? 'active' : ''}
            onClick={() => navigate('leaves')}
          >
            Leaves
          </button>
          <button
            className={activePage === 'departments' ? 'active' : ''}
            onClick={() => navigate('departments')}
          >
            Departments
          </button>
          <button
            className={activePage === 'offline' ? 'active' : ''}
            onClick={() => navigate('offline')}
          >
            Offline Leave
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

export default AdminDashboard;
