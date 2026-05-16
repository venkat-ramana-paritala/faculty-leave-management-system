import React from 'react';

function Help() {
  return (
    <div>
      <h2>Help / FAQ</h2>
      <div className="form-card" style={{ maxWidth: '600px' }}>
        <p style={{ marginBottom: '14px', color: '#475569' }}>
          <strong>Q: How do I apply for leave?</strong><br />
          Click on "Apply Leave" in the sidebar and fill in the dates and leave type.
        </p>
        <p style={{ marginBottom: '14px', color: '#475569' }}>
          <strong>Q: How do I check my leave balance?</strong><br />
          Open "Home" to see your total, used and remaining leaves.
        </p>
        <p style={{ marginBottom: '14px', color: '#475569' }}>
          <strong>Q: Who approves my leave?</strong><br />
          Your HOD reviews and approves or rejects leave requests.
        </p>
        <p style={{ marginBottom: '14px', color: '#475569' }}>
          <strong>Q: Can I cancel a leave request?</strong><br />
          Please contact your HOD or admin directly to cancel a submitted request.
        </p>
        <p style={{ color: '#475569' }}>
          <strong>Q: How do I change my password?</strong><br />
          Go to "Profile" and click "Change Password".
        </p>
      </div>
    </div>
  );
}

export default Help;
