import React, { useState, useEffect } from 'react';
import API from '../../api';

function FacultyHome() {
  const [data, setData] = useState(null);

  useEffect(() => { fetchHome(); }, []);

  async function fetchHome() {
    try {
      const res = await fetch(`${API}/faculty/home`, { credentials: 'include' });
      if (res.ok) setData(await res.json());
      else setData({ casualLeave: { total: 12, used: 0, balance: 12 }, recentLeaves: [], name: 'User' });
    } catch (err) {
      setData({ casualLeave: { total: 12, used: 0, balance: 12 }, recentLeaves: [], name: 'User' });
    }
  }

  function stageLabel(leave) {
    if (leave.status === 'APPROVED')  return { text: 'Approved',         color: '#16a34a' };
    if (leave.status === 'REJECTED')  return { text: 'Rejected',         color: '#dc2626' };
    if (leave.status === 'FORWARDED') return { text: 'With Principal',   color: '#7c3aed' };
    if (leave.currentStage === 'SUBSTITUTE') return { text: 'Awaiting Substitute', color: '#f59e0b' };
    return { text: 'With HOD', color: '#f59e0b' };
  }

  if (!data) return null;

  const { casualLeave, recentLeaves, name } = data;
  const pct = casualLeave.total > 0 ? Math.round((casualLeave.used / casualLeave.total) * 100) : 0;

  return (
    <div>
      <h2>Welcome, {name}</h2>

      {/* Stat cards */}
      <div className="stats-strip">
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{casualLeave.total}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Casual Leaves</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{casualLeave.used}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Leaves Taken</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>{casualLeave.balance}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Leaves Left</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ margin: '16px 0 28px 0' }}>
        <div style={{ marginBottom: '6px', fontSize: '0.85rem', color: '#64748b' }}>
          Casual Leave Used: <strong>{casualLeave.used} / {casualLeave.total}</strong>
        </div>
        <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '10px' }}>
          <div style={{
            background: pct >= 80 ? '#ef4444' : '#3b82f6',
            width: `${pct}%`,
            height: '10px',
            borderRadius: '8px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      <h3 style={{ marginBottom: '12px', color: '#1e293b' }}>Recent Applications</h3>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th colSpan="7" className="table-title">Your Leave Applications</th>
            </tr>
            <tr className="col-headers">
              <th>Category</th>
              <th>Duration</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Stage</th>
              <th>Sub Status</th>
            </tr>
          </thead>
          <tbody>
            {recentLeaves.length === 0 ? (
              <tr><td colSpan="7" className="info-text">No leave applications yet. Apply your first leave!</td></tr>
            ) : (
              recentLeaves.map((l, i) => {
                const s = stageLabel(l);
                return (
                  <tr key={i}>
                    <td>
                      <span className={`badge ${l.category === 'EXTENDED' ? 'badge-long' : 'badge-casual'}`}>
                        {l.category}
                      </span>
                      {l.category === 'EXTENDED' && l.extendedLeaveType !== 'N/A' && (
                        <span className="badge" style={{ background: '#fce7f3', color: '#be185d', marginLeft: '4px', fontSize: '0.7rem' }}>
                          {l.extendedLeaveType}
                        </span>
                      )}
                    </td>
                    <td>
                      {l.durationType === 'HALF' ? (
                        <span className="badge" style={{ background: '#bae6fd', color: '#0369a1' }}>
                          {l.halfDayPeriod === 'AFTERNOON' ? '½ AN' : '½ FN'}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full</span>
                      )}
                    </td>
                    <td>{new Date(l.from).toLocaleDateString()}</td>
                    <td>{new Date(l.to).toLocaleDateString()}</td>
                    <td style={{ color: s.color, fontWeight: 'bold' }}>{l.status}</td>
                    <td style={{ color: s.color, fontWeight: 600, fontSize: '0.85rem' }}>{s.text}</td>
                    <td>
                      {l.category === 'CASUAL' ? (
                        <span style={{
                          fontWeight: 600,
                          color: l.substituteStatus === 'VALID'   ? '#16a34a'
                               : l.substituteStatus === 'INVALID' ? '#dc2626'
                               : '#f59e0b'
                        }}>
                          {l.substituteStatus || 'N/A'}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacultyHome;
