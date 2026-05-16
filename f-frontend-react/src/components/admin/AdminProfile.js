import React, { useState, useEffect } from 'react';
import API from '../../api';

function AdminProfile() {
  const [profileData, setProfileData] = useState({ admin_id: '', name: '' });
  const [showForm, setShowForm] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await fetch(`${API}/admin/profile`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setNewName(data.name || '');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateProfile(type) {
    const data = {};
    if (type === 'name') {
      if (!newName) { alert('Name cannot be empty'); return; }
      data.name = newName;
    } else if (type === 'password') {
      if (newPass.length < 6) { alert('Password must be at least 6 characters'); return; }
      data.password = newPass;
    }

    try {
      const response = await fetch(`${API}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.mssg);
        setShowForm(null);
        setNewPass('');
        loadProfile();
      } else {
        alert(result.mssg || 'Update failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div>
      <h2>Admin Profile</h2>
      <div className="profile-card">
        <div className="info-row">Admin ID: <strong>{profileData.admin_id}</strong></div>

        <div className="action-buttons">
          <button onClick={() => setShowForm(showForm === 'name' ? null : 'name')}>
            Edit Name
          </button>
          <button onClick={() => setShowForm(showForm === 'password' ? null : 'password')}>
            Change Password
          </button>
        </div>

        {showForm === 'name' && (
          <div className="inline-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
            />
            <div className="save-cancel">
              <button className="btn-save" onClick={() => updateProfile('name')}>Save</button>
              <button className="btn-cancel" onClick={() => setShowForm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {showForm === 'password' && (
          <div className="inline-form">
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new password"
            />
            <div className="save-cancel">
              <button className="btn-save" onClick={() => updateProfile('password')}>Save</button>
              <button className="btn-cancel" onClick={() => setShowForm(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;
