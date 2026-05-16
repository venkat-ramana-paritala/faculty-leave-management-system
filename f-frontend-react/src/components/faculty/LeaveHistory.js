import React, { useState, useEffect } from 'react';
import API from '../../api';

function durationLabel(leave) {
  if (leave.durationType === 'HALF') {
    return leave.halfDayPeriod === 'AFTERNOON' ? '½ AN' : '½ FN';
  }
  return 'Full';
}

function statusColor(status) {
  if (status === 'APPROVED')  return '#16a34a';
  if (status === 'REJECTED')  return '#dc2626';
  if (status === 'FORWARDED') return '#3b82f6';
  return '#f59e0b';
}

function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => { fetchHistory(); }, []);

  async function fetchHistory() {
    try {
      const response = await fetch(`${API}/faculty/myLeaves`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        setLeaves(await response.json());
      }
    } catch (err) {
      // silent fail – show empty table
    }
  }

  const filtered = leaves.filter(l =>
    statusFilter === 'ALL' || l.status === statusFilter
  );

  return (
    <div>
      <h2>Leave History</h2>

      {/* Filter bar */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600 }}>Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="FORWARDED">Forwarded</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th colSpan="8" className="table-title">Your Leave Applications</th>
            </tr>
            <tr className="col-headers">
              <th>#</th>
              <th>Category</th>
              <th>Duration</th>
              <th>From</th>
              <th>To</th>
              <th>Timing</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="info-text">No leave records found.</td></tr>
            ) : (
              filtered.map((leave, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
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
                  <td>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: leave.applicationTiming === 'AFTER' ? '#dc2626' : '#16a34a'
                    }}>
                      {leave.applicationTiming === 'AFTER' ? '⚠ Emergency' : '✓ Advance'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '160px', fontSize: '0.85rem' }}>{leave.reason}</td>
                  <td style={{ color: statusColor(leave.status), fontWeight: 'bold' }}>
                    {leave.status}
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

export default LeaveHistory;
