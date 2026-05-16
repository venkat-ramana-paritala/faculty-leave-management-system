import React, { useState, useEffect } from 'react';
import API from '../../api';

function FacultyProfile() {
  const [profileData, setProfileData] = useState(null);
  const [showForm, setShowForm] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await fetch(`${API}/faculty/profile`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setNewName(data.name);
        setMessage('');
      } else {
        setProfileData({});
      }
    } catch (err) {
      setProfileData({});
    }
  }

  async function updateProfile(type) {
    const data = {};
    if (type === 'name') {
      if (!newName) { alert('Name is empty'); return; }
      data.name = newName;
    } else if (type === 'password') {
      if (!newPass) { alert('Password is empty'); return; }
      data.password = newPass;
    }

    try {
      const response = await fetch(`${API}/faculty/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.mssg || 'Updated successfully');
        setShowForm(null);
        setNewPass('');
        loadData();
      } else {
        alert(result.mssg || 'Update failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  if (!profileData) return null;

  return (
    <div>
      <h2>Faculty Profile</h2>
      <div className="profile-card">
        <div className="info-row">Name: <strong>{profileData.name}</strong></div>
        <div className="info-row">Email: <strong>{profileData.email}</strong></div>
        <div className="info-row">Faculty Code: <strong>{profileData.facultyCode}</strong></div>
        <div className="info-row">Department: <strong>{profileData.department?.name || profileData.department}</strong></div>
        <div className="info-row">Casual Leave Balance: <strong>{profileData.casualLeave?.balance} / {profileData.casualLeave?.total}</strong></div>

        <div className="action-buttons">
          <button onClick={() => setShowForm(showForm === 'name' ? null : 'name')}>
            Edit Name
          </button>
          <button onClick={() => setShowForm(showForm === 'password' ? null : 'password')}>
            Change Password
          </button>
        </div>

        {/* Edit Name form */}
        {showForm === 'name' && (
          <div className="inline-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New Name"
            />
            <div className="save-cancel">
              <button className="btn-save" onClick={() => updateProfile('name')}>Save</button>
              <button className="btn-cancel" onClick={() => setShowForm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Change Password form */}
        {showForm === 'password' && (
          <div className="inline-form">
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New Password"
            />
            <div className="save-cancel">
              <button className="btn-save" onClick={() => updateProfile('password')}>Update</button>
              <button className="btn-cancel" onClick={() => setShowForm(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyProfile;
