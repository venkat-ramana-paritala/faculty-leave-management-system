import React, { useState, useEffect } from 'react';
import API from '../../api';

function AdminProfile() {
  const [profileData, setProfileData] = useState({ admin_id: '' });
  const [showForm, setShowForm] = useState(false);
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
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updatePassword() {
    if (newPass.length < 6) { alert('Password must be at least 6 characters'); return; }

    try {
      const response = await fetch(`${API}/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass }),
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.mssg);
        setShowForm(false);
        setNewPass('');
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
        <div className="info-row">Role: <strong>Administrator</strong></div>

        <div className="action-buttons">
          <button onClick={() => setShowForm(!showForm)}>
            Change Password
          </button>
        </div>

        {showForm && (
          <div className="inline-form">
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new password"
            />
            <div className="save-cancel">
              <button className="btn-save" onClick={updatePassword}>Save</button>
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;

