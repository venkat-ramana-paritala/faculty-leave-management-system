import React from 'react';

function Rules() {
  return (
    <div className="rules-container">
      <h2>Rules and Regulations</h2>
      <div className="form-card" style={{ maxWidth: '800px', width: '100%' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '5px' }}>Leave Policies</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div>
            <h4 style={{ color: '#3b82f6', marginBottom: '10px' }}>Casual Leave (CL)</h4>
            <ul style={{ lineHeight: '1.8', paddingLeft: '20px', color: '#475569', fontSize: '0.95rem' }}>
              <li><strong>Limit:</strong> Maximum 5 consecutive days per application.</li>
              <li><strong>Substitute:</strong> Mandatory substitute arrangement required within the same department.</li>
              <li><strong>Half-Day:</strong> Supported (Morning or Afternoon sessions).</li>
              <li><strong>Timing:</strong> Can be applied in advance (BEFORE) or for emergencies (AFTER).</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#db2777', marginBottom: '10px' }}>Extended Leaves</h4>
            <ul style={{ lineHeight: '1.8', paddingLeft: '20px', color: '#475569', fontSize: '0.95rem' }}>
              <li><strong>Earned Leave:</strong> Maximum 7 days per application.</li>
              <li><strong>Half Pay Leave (HPL):</strong> Maximum 8 days per application.</li>
              <li><strong>Medical Leave:</strong> Maximum 7 days per application.</li>
              <li><strong>Substitute:</strong> Not required for extended leaves.</li>
              <li><strong>Requirement:</strong> Contact address and valid 10-digit phone number must be provided.</li>
            </ul>
          </div>
        </div>

        <h3 style={{ color: '#1e293b', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '5px' }}>General Guidelines</h3>
        <ul style={{ lineHeight: '1.8', paddingLeft: '20px', color: '#475569', fontSize: '0.95rem' }}>
          <li><strong>Approval Flow:</strong> Faculty → Substitute (for CL) → HOD → Principal.</li>
          <li><strong>Phone Numbers:</strong> Must be 10 digits and start with 6, 7, 8, or 9.</li>
          <li><strong>Emergency Leaves:</strong> Must be classified as LWP or Unauthorized if rejected by the Principal.</li>
          <li><strong>Offline Leaves:</strong> Only Admin can record leaves that were approved on paper.</li>
        </ul>
      </div>
    </div>
  );
}

export default Rules;
