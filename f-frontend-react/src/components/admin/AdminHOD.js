import React, { useState, useEffect } from 'react';
import API from '../../api';

function AdminHOD() {
  const [hods, setHods] = useState([]);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetchHOD();
  }, []);

  async function fetchHOD() {
    try {
      const response = await fetch(`${API}/admin/hod`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) { setHods([]); return; }

      const data = await response.json();
      setHods(data);
    } catch (err) { /* silent */ }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>HOD Records (All Departments)</h2>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table admin">
        <thead>
          <tr>
            <th colSpan="4" className="table-title">Department Heads</th>
          </tr>
          <tr className="col-headers">
            <th>Name</th>
            <th>Code</th>
            <th>Department</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {hods.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No HOD members found</td></tr>
          ) : (
            hods.map((h, index) => (
              <tr key={index}>
                <td><strong>{h.name}</strong><br/><small>{h.email}</small></td>
                <td>{h.facultyCode}</td>
                <td>{h.departmentId?.name || '—'}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: h.isActive ? '#dcfce7' : '#fee2e2',
                    color: h.isActive ? '#166534' : '#991b1b',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {h.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminHOD;
