import React, { useState, useEffect } from 'react';
import API from '../../api';

function PrincipalRequestHistory() {
  const [leaves, setLeaves] = useState([]);
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => { fetchHistory(); }, []);

  async function fetchHistory() {
    try {
      const res = await fetch(`${API}/principal/requestHistory`, { credentials: 'include' });
      if (res.ok) setLeaves(await res.json());
      else setLeaves([]);
    } catch (err) { setLeaves([]); }
  }

  const filtered = leaves.filter(l =>
    actionFilter === 'ALL' || l.principalAction === actionFilter
  );

  return (
    <div>
      <h2>Request History (Principal)</h2>

      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600 }}>Filter by Decision:</label>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th colSpan="8" className="table-title">Decision History</th>
            </tr>
            <tr className="col-headers">
              <th>Faculty</th>
              <th>Dept</th>
              <th>Category</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Decision</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="info-text">No history found.</td></tr>
            ) : (
              filtered.map((l, i) => (
                <tr key={i}>
                  <td>
                    <strong>{l.facultyId?.name}</strong><br />
                    <small style={{ color: '#64748b' }}>{l.facultyId?.facultyCode}</small>
                  </td>
                  <td>{l.departmentId?.code}</td>
                  <td>
                    <span className={`badge ${l.category === 'EXTENDED' ? 'badge-long' : 'badge-casual'}`}>
                      {l.category}
                    </span>
                    {l.durationType === 'HALF' && (
                      <span className="badge" style={{ background: '#bae6fd', color: '#0369a1', marginLeft: '4px', fontSize: '0.7rem' }}>
                        {l.halfDayPeriod === 'AFTERNOON' ? '½ AN' : '½ FN'}
                      </span>
                    )}
                  </td>
                  <td>{new Date(l.from).toLocaleDateString()}</td>
                  <td>{new Date(l.to).toLocaleDateString()}</td>
                  <td style={{ maxWidth: '160px', fontSize: '0.85rem' }}>{l.reason}</td>
                  <td>
                    <span style={{
                      fontWeight: 'bold',
                      color: l.principalAction === 'APPROVED' ? '#16a34a' : '#dc2626'
                    }}>
                      {l.principalAction}
                    </span>
                    {l.absenceClassification && l.absenceClassification !== 'N/A' && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>({l.absenceClassification})</div>
                    )}
                  </td>
                  <td style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.85rem' }}>
                    {l.principalRemarks || '—'}
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

export default PrincipalRequestHistory;
