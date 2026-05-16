import React, { useState, useEffect } from 'react';
import API from '../../api';

function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      const response = await fetch(`${API}/admin/departments`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        setMessage(data.length === 0 ? 'No departments found. Please add one.' : '');
      } else {
        setMessage('Failed to load departments');
      }
    } catch (err) {
      setMessage('Connection error: Please check if the server is running.');
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/admin/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code: code.toUpperCase() }),
        credentials: 'include'
      });
      const result = await response.json();
      if (response.ok) {
        alert('Department created successfully!');
        setName('');
        setCode('');
        fetchDepartments();
      } else {
        alert(result.mssg || 'Failed to create department');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Manage Departments</h2>
      
      {/* Create form */}
      <div className="form-card admin">
        <h3>Add New Department</h3>
        <form onSubmit={handleCreate}>
          <label>Department Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Computer Science and Engineering"
            required
          />

          <label>Department Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. CSE"
            maxLength={5}
            required
          />

          <button type="submit" className="btn-submit">Create Department</button>
        </form>
      </div>

      <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Existing Departments</h3>
      {message && <p className="page-message">{message}</p>}
      
      {departments.length > 0 ? (
        <table className="data-table admin">
          <thead>
            <tr className="col-headers">
              <th>Code</th>
              <th>Full Department Name</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={index}>
                <td><strong>{dept.code}</strong></td>
                <td>{dept.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !message && (
        <p className="info-text">No departments found.</p>
      )}
    </div>
  );
}

export default AdminDepartments;
