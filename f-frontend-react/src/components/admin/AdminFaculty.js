import React, { useState, useEffect } from 'react';
import API from '../../api';

function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetchFaculty();
  }, []);

  async function fetchFaculty() {
    try {
      const response = await fetch(`${API}/admin/faculty`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) { setFaculty([]); return; }

      const data = await response.json();
      setFaculty(data);
    } catch (err) { /* silent */ }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Faculty Records (All Departments)</h2>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table admin">
        <thead>
          <tr>
            <th colSpan="5" className="table-title">Full Faculty Directory</th>
          </tr>
          <tr className="col-headers">
            <th>Name</th>
            <th>Code</th>
            <th>Dept</th>
            <th>CL Balance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {faculty.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No faculty members found</td></tr>
          ) : (
            faculty.map((f, index) => (
              <tr key={index}>
                <td><strong>{f.name}</strong><br/><small>{f.email}</small></td>
                <td>{f.facultyCode}</td>
                <td>{f.departmentId?.name || '—'}</td>
                <td style={{ fontWeight: 'bold', color: (f.casualLeave?.balance ?? 15) < 3 ? '#dc2626' : '#1e293b' }}>
                  {f.casualLeave?.balance ?? 15} / {f.casualLeave?.total ?? 15}
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: f.isActive ? '#dcfce7' : '#fee2e2',
                    color: f.isActive ? '#166534' : '#991b1b',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {f.isActive ? 'ACTIVE' : 'INACTIVE'}
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

export default AdminFaculty;
