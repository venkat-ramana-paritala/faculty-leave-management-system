import React, { useState, useEffect } from 'react';
import API from '../../api';

function durationLabel(leave) {
  if (leave.durationType === 'HALF') {
    return leave.halfDayPeriod === 'AFTERNOON' ? '½ AN' : '½ FN';
  }
  return 'Full';
}

function HodRequestHistory() {
  const [leaves, setLeaves] = useState([]);
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => { fetchHistory(); }, []);

  async function fetchHistory() {
    try {
      const response = await fetch(`${API}/hod/requestHistory`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        setLeaves(await response.json());
      }
    } catch (err) {
      // silent fail
    }
  }

  const filtered = leaves.filter(l =>
    actionFilter === 'ALL' || l.hodAction === actionFilter
  );

  return (
    <div>
      <h2>Request History (HOD)</h2>

      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600 }}>Filter by HOD Action:</label>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All</option>
          <option value="FORWARDED">Forwarded</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th colSpan="8" className="table-title">Department History</th>
            </tr>
            <tr className="col-headers">
              <th>Faculty</th>
              <th>Category</th>
              <th>Duration</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>HOD Action</th>
              <th>HOD Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="info-text">No history found.</td></tr>
            ) : (
              filtered.map((leave, index) => (
                <tr key={index}>
                  <td>
                    <strong>{leave.facultyId?.name}</strong><br />
                    <small style={{ color: '#64748b' }}>{leave.facultyId?.facultyCode}</small>
                  </td>
                  <td>
                    <span className={`badge ${leave.category === 'EXTENDED' ? 'badge-long' : 'badge-casual'}`}>
                      {leave.category}
                    </span>
                    {leave.category === 'EXTENDED' && leave.extendedLeaveType !== 'N/A' && (
                      <span className="badge" style={{ background: '#fce7f3', color: '#be185d', marginLeft: '4px', fontSize: '0.7rem' }}>
                        {leave.extendedLeaveType}
                      </span>
                    )}
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
                  <td>{new Date(leave.from).toLocaleDateString()}</td>
                  <td>{new Date(leave.to).toLocaleDateString()}</td>
                  <td style={{ maxWidth: '160px', fontSize: '0.85rem' }}>{leave.reason}</td>
                  <td style={{
                    fontWeight: 'bold',
                    color: leave.hodAction === 'FORWARDED' ? '#16a34a' : '#dc2626'
                  }}>
                    {leave.hodAction}
                  </td>
                  <td style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.85rem' }}>
                    {leave.hodRemarks || '—'}
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

export default HodRequestHistory;
