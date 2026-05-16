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
          <h4>Kakatiya Institute Of Technology &amp; Science, Warangal</h4>
        </div>
        <h5>Welcome, Admin!</h5>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="main-body">
        <div className="sidebar admin">
          <button
            className={activePage === 'faculty' ? 'active' : ''}
            onClick={() => setActivePage('faculty')}
          >
            Faculty
          </button>
          <button
            className={activePage === 'createFaculty' ? 'active' : ''}
            onClick={() => setActivePage('createFaculty')}
          >
            Create Faculty
          </button>
          <button
            className={activePage === 'hod' ? 'active' : ''}
            onClick={() => setActivePage('hod')}
          >
            HOD
          </button>
          <button
            className={activePage === 'createHOD' ? 'active' : ''}
            onClick={() => setActivePage('createHOD')}
          >
            Create HOD
          </button>
          <button
            className={activePage === 'leaves' ? 'active' : ''}
            onClick={() => setActivePage('leaves')}
          >
            Leaves
          </button>
          <button
            className={activePage === 'departments' ? 'active' : ''}
            onClick={() => setActivePage('departments')}
          >
            Departments
          </button>
          <button
            className={activePage === 'offline' ? 'active' : ''}
            onClick={() => setActivePage('offline')}
          >
            Offline Leave
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

export default AdminDashboard;
