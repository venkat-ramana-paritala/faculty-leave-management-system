import React, { useState, useEffect } from 'react';
import API from '../../api';

function AdminCreateFaculty({ onDone }) {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [facultyCode, setFacultyCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      const response = await fetch(`${API}/admin/departments`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        if (data.length > 0) setDepartmentId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load departments');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!departmentId) {
      alert('Please select a department. If none exist, create one first.');
      return;
    }

    const data = { 
      name, 
      email, 
      password, 
      phone,
      facultyCode: facultyCode.toUpperCase(), 
      departmentId 
    };

    try {
      const response = await fetch(`${API}/admin/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();
      if (response.ok) {
        alert('Faculty created successfully');
        if (onDone) onDone();
      } else {
        alert(result.mssg || 'Failed to create faculty');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div>
      <h2>Create Faculty</h2>
      <div className="form-card admin">
        <form onSubmit={handleSubmit}>
          <label>Faculty Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@kitsw.ac.in"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Initial password"
            required
          />

          <label>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
            required
          />

          <label>Faculty Code</label>
          <input
            type="text"
            value={facultyCode}
            onChange={(e) => setFacultyCode(e.target.value)}
            placeholder="e.g. ABC (uppercase)"
            required
          />

          <label>Department</label>
          <select 
            value={departmentId} 
            onChange={(e) => setDepartmentId(e.target.value)}
            required
          >
            {departments.length === 0 && <option value="">Loading / None available...</option>}
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <button type="submit" className="btn-submit">Create Faculty</button>
        </form>
      </div>
    </div>
  );
}

export default AdminCreateFaculty;
