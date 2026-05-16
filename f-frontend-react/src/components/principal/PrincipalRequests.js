import React, { useState, useEffect } from 'react';
import API from '../../api';

function PrincipalRequests() {
  const [leaves, setLeaves] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [classifications, setClassifications] = useState({});
  const [processing, setProcessing] = useState(null);
  const [errorMsg, setErrorMsg] = useState({});

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    try {
      const res = await fetch(`${API}/principal/pendingRequests`, { credentials: 'include' });
      if (res.ok) setLeaves(await res.json());
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

    const leave = leaves.find(l => l._id === leaveId);
    if (!leave) return;

    const classification = classifications[leaveId];
    if (action === 'REJECTED' && leave.applicationTiming === 'AFTER' && !classification) {
      setErrorMsg(prev => ({ ...prev, [leaveId]: 'Please select an absence classification (LWP / Unauthorized) before rejecting an emergency leave.' }));
      return;
    }

    setProcessing(leaveId);
    try {
      const res = await fetch(`${API}/principal/request/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          remarks: remark,
          absenceClassification: action === 'REJECTED' ? classification : null
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) { 
          fetchRequests(); 
          setRemarks(prev => ({ ...prev, [leaveId]: '' }));
          setClassifications(prev => ({ ...prev, [leaveId]: '' }));
      } else {
          setErrorMsg(prev => ({ ...prev, [leaveId]: data.mssg || 'Something went wrong' }));
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
              <th colSpan="9" className="table-title">Requests Awaiting Your Decision</th>
            </tr>
            <tr className="col-headers">
              <th>Faculty &amp; Dept</th>
              <th>Category</th>
              <th>Duration</th>
              <th>From</th>
              <th>To</th>
              <th>Timing</th>
              <th>Reason</th>
              <th>HOD Remarks</th>
              <th>Your Remarks &amp; Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan="9" className="info-text">No pending requests.</td></tr>
            ) : (
              leaves.map((leave, i) => (
                <tr key={i}>
                  <td>
                    <strong>{leave.facultyId?.name}</strong><br />
                    <small style={{ color: '#64748b' }}>
                      {leave.facultyId?.facultyCode} | {leave.departmentId?.code}
                    </small>
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
                  <td>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: leave.applicationTiming === 'AFTER' ? '#dc2626' : '#16a34a'
                    }}>
                      {leave.applicationTiming === 'AFTER' ? '⚠ Emergency' : '✓ Advance'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '150px', fontSize: '0.85rem' }}>{leave.reason}</td>
                  <td>
                    <em style={{ color: '#64748b', fontSize: '0.85rem' }}>{leave.hodRemarks || '—'}</em>
                  </td>
                  <td>
                    <textarea
                      style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}
                      placeholder="Enter remarks (required)..."
                      value={remarks[leave._id] || ''}
                      onChange={e => updateRemarks(leave._id, e.target.value)}
                      rows={2}
                    />
                    {leave.applicationTiming === 'AFTER' && (
                      <select
                        style={{ fontSize: '0.8rem', padding: '4px', width: '100%', marginBottom: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        value={classifications[leave._id] || ''}
                        onChange={e => setClassifications(prev => ({ ...prev, [leave._id]: e.target.value }))}
                      >
                        <option value="">— Classify if Rejecting —</option>
                        <option value="LWP">LWP (Leave Without Pay)</option>
                        <option value="UNAUTHORIZED">Unauthorized Absence</option>
                      </select>
                    )}
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="btn-approve" disabled={processing === leave._id} onClick={() => handleDecision(leave._id, 'APPROVED')}>
                          {processing === leave._id ? '...' : 'Approve'}
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

export default PrincipalRequests;
