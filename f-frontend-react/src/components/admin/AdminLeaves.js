import React, { useState, useEffect } from 'react';
import API from '../../api';

function getStatusColor(status) {
  if (status === 'PENDING')   return '#f59e0b';
  if (status === 'APPROVED')  return '#16a34a';
  if (status === 'REJECTED')  return '#ef4444';
  if (status === 'FORWARDED') return '#3b82f6';
  return '#64748b';
}

function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => { fetchLeaves(); }, []);

  async function fetchLeaves() {
    try {
      const response = await fetch(`${API}/admin/leaves`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) setLeaves(await response.json());
      else setLeaves([]);
    } catch (err) { setLeaves([]); }
  }

  const filtered = leaves
    .filter(l => {
      const name = l.facultyId?.name?.toLowerCase() || '';
      const code = l.facultyId?.facultyCode?.toLowerCase() || '';
      const q = searchTerm.toLowerCase();
      return name.includes(q) || code.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.from) - new Date(a.from);
      if (sortBy === 'oldest') return new Date(a.from) - new Date(b.from);
      if (sortBy === 'name')   return (a.facultyId?.name || '').localeCompare(b.facultyId?.name || '');
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Leave Records (All Departments)</h2>

      {/* Search / sort bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by faculty name or code..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: '1', minWidth: '200px' }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '160px' }}
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="name">Sort: By Name</option>
          <option value="status">Sort: By Status</option>
        </select>
        <button
          onClick={fetchLeaves}
          style={{ padding: '9px 18px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th colSpan="10" className="table-title">All Leave Records</th>
            </tr>
            <tr className="col-headers">
              <th>Faculty</th>
              <th>Dept</th>
              <th>Category</th>
              <th>Duration</th>
              <th>From</th>
              <th>To</th>
              <th>Timing</th>
              <th>Source</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="10" className="info-text">No leave records found.</td></tr>
            ) : (
              filtered.map((l, i) => (
                <tr key={i}>
                  <td>
                    <strong>{l.facultyId?.name || 'Unknown'}</strong><br />
                    <small style={{ color: '#64748b' }}>{l.facultyId?.facultyCode || '—'}</small>
                  </td>
                  <td>{l.departmentId?.code || '—'}</td>
                  <td>
                    <span className={`badge ${l.category === 'EXTENDED' ? 'badge-long' : 'badge-casual'}`}>
                      {l.category}
                    </span>
                    {l.category === 'EXTENDED' && l.extendedLeaveType !== 'N/A' && (
                      <div style={{ fontSize: '0.7rem', color: '#be185d', marginTop: '2px' }}>{l.extendedLeaveType}</div>
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
                  <td>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: l.applicationTiming === 'AFTER' ? '#dc2626' : '#16a34a'
                    }}>
                      {l.applicationTiming === 'AFTER' ? '⚠ Emergency' : '✓ Advance'}
                    </span>
                  </td>
                  <td>
                    {l.formType === 'OFFLINE' && l.documentUrl ? (
                      <a
                        href={`${API}/${l.documentUrl.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none' }}
                        title="View Offline Document"
                      >
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          OFFLINE 📎
                        </span>
                      </a>
                    ) : (
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        background: '#f0f9ff',
                        color: '#0369a1',
                        border: '1px solid #bae6fd'
                      }}>
                        {l.formType || 'ONLINE'}
                      </span>
                    )}
                  </td>
                  <td style={{ color: getStatusColor(l.status), fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {l.status}
                  </td>
                  <td style={{ maxWidth: '160px', fontSize: '0.8rem' }} title={l.reason}>
                    {l.reason}
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

export default AdminLeaves;
