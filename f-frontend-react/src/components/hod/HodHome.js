import React, { useState, useEffect } from 'react';
import API from '../../api';

function HodHome() {
  const [pendingCount, setPendingCount] = useState(0);
  const [recentLeaves, setRecentLeaves] = useState([]);

  useEffect(() => { fetchHome(); }, []);

  function cleanDate(d) { return new Date(d).toLocaleDateString(); }

  async function fetchHome() {
    try {
      const response = await fetch(`${API}/hod/home`, { method: 'GET', credentials: 'include' });
      if (response.ok) {
        const result = await response.json();
        setPendingCount(result.pendingCount || 0);
        setRecentLeaves(result.recentResolved || []);
      }
    } catch (err) { /* silent */ }
  }

  return (
    <div>
      <h2>HOD Dashboard</h2>

      <div className="stats-strip">
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Pending Requests</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{recentLeaves.length}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Recently Processed</div>
        </div>
      </div>

      <h3 style={{ marginTop: '28px', marginBottom: '12px', color: '#1e293b' }}>Recently Processed Applications</h3>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table hod">
          <thead>
            <tr>
              <th colSpan="7" className="table-title">Recently Processed Applications</th>
            </tr>
            <tr className="col-headers">
              <th>Faculty</th>
              <th>Category</th>
              <th>Duration</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>HOD Action</th>
            </tr>
          </thead>
          <tbody>
            {recentLeaves.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No recent history found.</td></tr>
            ) : (
              recentLeaves.map((leave, index) => (
                <tr key={index}>
                  <td>
                    <strong>{leave.faculty?.name}</strong><br />
                    <small style={{ color: '#64748b' }}>{leave.faculty?.facultyCode}</small>
                  </td>
                  <td>
                    <span className={`badge ${leave.category === 'EXTENDED' ? 'badge-long' : 'badge-casual'}`}>
                      {leave.category}
                    </span>
                  </td>
                  <td>
                    {leave.durationType === 'HALF' ? (
                      <span className="badge" style={{ background: '#bae6fd', color: '#0369a1' }}>
                        {leave.halfDayPeriod === 'AFTERNOON' ? '½ AN' : '½ FN'}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full</span>
                    )}
                  </td>
                  <td>{cleanDate(leave.from)}</td>
                  <td>{cleanDate(leave.to)}</td>
                  <td style={{ maxWidth: '180px', fontSize: '0.85rem' }}>{leave.reason}</td>
                  <td style={{
                    color: leave.hodAction === 'FORWARDED' ? '#16a34a' : '#dc2626',
                    fontWeight: 'bold'
                  }}>
                    {leave.hodAction}
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

export default HodHome;
