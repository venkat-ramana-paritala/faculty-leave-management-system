import React, { useState, useEffect } from 'react';
import API from '../../api';

function SubstituteRequests() {
  const [requests, setRequests] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [errorMsg, setErrorMsg] = useState({});

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    try {
      const response = await fetch(`${API}/faculty/substituteRequests`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) setRequests(await response.json());
    } catch (err) { /* silent */ }
  }

  async function handleAction(leaveId, action) {
    setProcessing(leaveId);
    setErrorMsg(prev => ({ ...prev, [leaveId]: '' }));
    try {
      const response = await fetch(`${API}/faculty/substituteRequest/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) { 
          fetchRequests(); 
      } else { 
          setErrorMsg(prev => ({ ...prev, [leaveId]: data.mssg || 'Action failed' })); 
      }
    } catch (err) {
      setErrorMsg(prev => ({ ...prev, [leaveId]: 'Error: ' + err.message }));
    }
    setProcessing(null);
  }

  return (
    <div>
      <h2>Substitute Requests</h2>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th colSpan="6" className="table-title">Requests Awaiting Your Acceptance</th>
            </tr>
            <tr className="col-headers">
              <th>Faculty</th>
              <th>Duration</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="6" className="info-text">No pending substitute requests found.</td></tr>
            ) : (
              requests.map((req, index) => (
                <tr key={index}>
                  <td>
                    <strong>{req.facultyId?.name}</strong><br />
                    <small style={{ color: '#64748b' }}>{req.facultyId?.facultyCode}</small>
                  </td>
                  <td>
                    {req.durationType === 'HALF' ? (
                      <span className="badge" style={{ background: '#bae6fd', color: '#0369a1' }}>
                        {req.halfDayPeriod === 'AFTERNOON' ? '½ AN' : '½ FN'}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full</span>
                    )}
                  </td>
                  <td>{new Date(req.from).toLocaleDateString()}</td>
                  <td>{new Date(req.to).toLocaleDateString()}</td>
                  <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{req.reason}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-approve" disabled={processing === req._id} onClick={() => handleAction(req._id, 'ACCEPTED')}>
                          {processing === req._id ? '...' : 'Accept'}
                      </button>
                      <button className="btn-reject" disabled={processing === req._id} onClick={() => handleAction(req._id, 'REJECTED')}>
                          {processing === req._id ? '...' : 'Reject'}
                      </button>
                    </div>
                    {errorMsg[req._id] && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px' }}>{errorMsg[req._id]}</div>}
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

export default SubstituteRequests;
