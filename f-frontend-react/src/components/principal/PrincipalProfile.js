import React, { useState, useEffect } from 'react';
import API from '../../api';

function PrincipalProfile() {
  const [profileData, setProfileData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await fetch(`${API}/principal/profile`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setMessage('');
      } else {
        setProfileData({});
      }
    } catch (err) {
      setProfileData({});
    }
  }

  async function updatePassword(e) {
    e.preventDefault();
    if (newPass.length < 6) { alert('Password must be at least 6 characters'); return; }
    try {
      const res = await fetch(`${API}/principal/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) { 
        alert(data.mssg || 'Password updated'); 
        setShowForm(false); 
        setNewPass(''); 
      }
      else alert(data.mssg || 'Update failed');
    } catch (err) { alert('Error: ' + err.message); }
  }

  if (!profileData) return null;

  return (
    <div>
      <h2>Principal Profile</h2>
      <div className="profile-card">
        <div className="info-row">Name: <strong>{profileData.name}</strong></div>
        <div className="info-row">Email: <strong>{profileData.email}</strong></div>
        <div className="info-row">Role: <strong>Principal</strong></div>
        <div className="info-row">Institution: <strong>KITSW, Warangal</strong></div>

        <div className="action-buttons">
          <button onClick={() => setShowForm(!showForm)}>Change Password</button>
        </div>

        {showForm && (
          <form className="inline-form" onSubmit={updatePassword}>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password"
              required
            />
            <div className="save-cancel">
              <button type="submit" className="btn-save">Update</button>
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PrincipalProfile;
