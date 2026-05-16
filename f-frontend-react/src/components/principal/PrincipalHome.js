import React, { useState, useEffect } from 'react';
import API from '../../api';

function PrincipalHome() {
  const [data, setData] = useState({ pendingCount: 0, recentResolved: [] });

  useEffect(() => { fetchHome(); }, []);

  async function fetchHome() {
    try {
      const res = await fetch(`${API}/principal/home`, { credentials: 'include' });
      if (res.ok) setData(await res.json());
    } catch (err) { /* silent */ }
  }

  function decisionColor(action) {
    return action === 'APPROVED' ? '#16a34a' : '#dc2626';
  }

  return (
    <div>
      <h2>Principal — Dashboard</h2>

      <div className="stats-strip">
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>{data.pendingCount}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Pending Requests</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>{data.recentResolved.length}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Decisions Made Recently</div>
        </div>
      </div>

      <h3 style={{ marginTop: '28px', marginBottom: '12px', color: '#1e293b' }}>Recently Decided</h3>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th colSpan="7" className="table-title">Recently Decided Applications</th>
            </tr>
            <tr className="col-headers">
              <th>Faculty</th>
              <th>Dept</th>
              <th>Category</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            {data.recentResolved.length === 0 ? (
              <tr><td colSpan="7" className="info-text">No decisions made yet.</td></tr>
            ) : (
              data.recentResolved.map((l, i) => (
                <tr key={i}>
                  <td>
                    <strong>{l.faculty?.name}</strong><br />
                    <small style={{ color: '#64748b' }}>{l.faculty?.facultyCode}</small>
                  </td>
                  <td>{l.department?.code}</td>
                  <td>
                    <span className={`badge ${l.category === 'EXTENDED' ? 'badge-long' : 'badge-casual'}`}>
                      {l.category}
                    </span>
                  </td>
                  <td>{new Date(l.from).toLocaleDateString()}</td>
                  <td>{new Date(l.to).toLocaleDateString()}</td>
                  <td style={{ maxWidth: '160px', fontSize: '0.85rem' }}>{l.reason}</td>
                  <td style={{ color: decisionColor(l.principalAction), fontWeight: 'bold' }}>
                    {l.principalAction}
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

export default PrincipalHome;
