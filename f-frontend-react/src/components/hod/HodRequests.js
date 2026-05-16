import React, { useState, useEffect } from 'react';
import API from '../../api';

function HodRequests() {
  const [leaves, setLeaves] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [processing, setProcessing] = useState(null);
  const [errorMsg, setErrorMsg] = useState({});

  useEffect(() => { fetchRequests(); }, []);

  function cleanDate(d) { return new Date(d).toLocaleDateString(); }

  async function fetchRequests() {
    try {
      const response = await fetch(`${API}/hod/pendingRequests`, { method: 'GET', credentials: 'include' });
      if (response.ok) setLeaves(await response.json());
      else setLeaves([]);
    } catch (err) { setLeaves([]); }
  }

  async function handleDecision(leaveId, action) {
    setErrorMsg(prev => ({ ...prev, [leaveId]: '' }));
    const remark = (remarks[leaveId] || '').trim();
    if (!remark) { 
        setErrorMsg(prev => ({ ...prev, [leaveId]: 'Remarks are required before submitting a decision.' })); 
        return; 
    }

    setProcessing(leaveId);
    try {
      const response = await fetch(`${API}/hod/request/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks: remark }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) { 
          fetchRequests(); 
          setRemarks(prev => ({ ...prev, [leaveId]: '' }));
      } else {
          setErrorMsg(prev => ({ ...prev, [leaveId]: data.mssg || 'Update failed' }));
      }
    } catch (err) { 
        setErrorMsg(prev => ({ ...prev, [leaveId]: 'Error: ' + err.message }));
    }
    setProcessing(null);
  }

  function updateRemarks(leaveId, value) {
    setRemarks(prev => ({ ...prev, [leaveId]: value }));
    if (errorMsg[leaveId]) setErrorMsg(prev => ({ ...prev, [leaveId]: '' }));
  }

  return (
    <div>
      <h2>Pending Leave Requests</h2>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th colSpan="9" className="table-title">Department Leave Applications Awaiting Decision</th>
            </tr>
            <tr className="col-headers">
              <th>Faculty</th>
              <th>Category</th>
              <th>Duration</th>
              <th>From</th>
              <th>To</th>
              <th>Timing</th>
              <th>Reason</th>
              <th>Substitute</th>
              <th>Remarks &amp; Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan="9" className="info-text">No pending requests.</td></tr>
            ) : (
              leaves.map((leave, index) => (
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
                  <td>{cleanDate(leave.from)}</td>
                  <td>{cleanDate(leave.to)}</td>
                  <td>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 600,
                      color: leave.applicationTiming === 'AFTER' ? '#dc2626' : '#16a34a'
                    }}>
                      {leave.applicationTiming === 'AFTER' ? '⚠ Emergency' : '✓ Advance'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '180px', fontSize: '0.85rem' }}>{leave.reason}</td>
                  <td>
                    {leave.category === 'CASUAL' ? (
                      <>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{leave.substituteId?.name || 'N/A'}</div>
                        <small style={{ color: '#64748b' }}>{leave.substituteId?.facultyCode || ''}</small>
                      </>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td>
                    <textarea
                      style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}
                      placeholder="Enter remarks (required)..."
                      value={remarks[leave._id] || ''}
                      onChange={e => updateRemarks(leave._id, e.target.value)}
                      rows={2}
                    />
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="btn-approve" disabled={processing === leave._id} onClick={() => handleDecision(leave._id, 'FORWARDED')}>
                          {processing === leave._id ? '...' : 'Forward'}
                      </button>
                      <button className="btn-reject" disabled={processing === leave._id} onClick={() => handleDecision(leave._id, 'REJECTED')}>
                          {processing === leave._id ? '...' : 'Reject'}
                      </button>
                    </div>
                    {errorMsg[leave._id] && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>{errorMsg[leave._id]}</div>}
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

export default HodRequests;
