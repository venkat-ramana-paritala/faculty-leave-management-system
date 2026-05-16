import React, { useState, useEffect } from 'react';
import API from '../../api';

function ApplyLeave() {
  const [step, setStep] = useState(1); // 1: Type Selection, 2: Form
  const [category, setCategory] = useState(''); // 'CASUAL' or 'EXTENDED'
  
  // Common fields
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  // Casual specific
  const [durationType, setDurationType] = useState('FULL');
  const [halfDayPeriod, setHalfDayPeriod] = useState('MORNING');
  const [substituteId, setSubstituteId] = useState('');
  const [substitutes, setSubstitutes] = useState([]);

  // Extended specific
  const [extendedType, setExtendedType] = useState('EARNED'); // EARNED, HPL, MEDICAL
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  useEffect(() => {
    if (category === 'CASUAL' && from && to) {
      fetchSubstitutes(from, to);
    }
  }, [from, to, category]);

  async function fetchSubstitutes(startDate, endDate) {
    try {
      const response = await fetch(`${API}/faculty/availableSubstitutes?from=${startDate}&to=${endDate}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSubstitutes(data);
      }
    } catch (err) {
      console.error('Error fetching substitutes:', err);
    }
  }

  function validateLimits() {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);
    const numDays = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    if (category === 'CASUAL') {
      if (numDays > 5 && durationType === 'FULL') {
        alert('Casual leave cannot exceed 5 days');
        return false;
      }
    } else {
      if (extendedType === 'EARNED' && numDays > 7) {
        alert('Earned Leave cannot exceed 7 days');
        return false;
      }
      if (extendedType === 'HPL' && numDays > 8) {
        alert('Half Pay Leave cannot exceed 8 days');
        return false;
      }
      if (extendedType === 'MEDICAL' && numDays > 7) {
        alert('Medical Leave cannot exceed 7 days');
        return false;
      }
      
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        alert('Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9');
        return false;
      }
    }
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateLimits()) return;

    const payload = {
      category,
      from,
      to,
      reason,
      applicationTiming: 'BEFORE', // Default for this simplified view
      substituteId: category === 'CASUAL' ? substituteId : null,
      durationType: category === 'CASUAL' ? durationType : 'FULL',
      halfDayPeriod: (category === 'CASUAL' && durationType === 'HALF') ? halfDayPeriod : null,
      extendedLeaveType: category === 'EXTENDED' ? extendedType : 'N/A',
      contactDetails: category === 'EXTENDED' ? { address, phone } : null
    };

    try {
      const response = await fetch(`${API}/faculty/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const result = await response.json();
      if (response.ok) {
        alert('Leave applied successfully!');
        resetForm();
      } else {
        alert('Failed: ' + (result.mssg || 'Unknown error'));
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  }

  function resetForm() {
    setStep(1);
    setCategory('');
    setFrom('');
    setTo('');
    setReason('');
    setSubstituteId('');
    setAddress('');
    setPhone('');
  }

  if (step === 1) {
    return (
      <div className="apply-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1e293b' }}>Apply for Leave</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>Select the type of leave you wish to apply for</p>
        
        <div className="type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
          <div 
            className="type-card"
            onClick={() => { setCategory('CASUAL'); setStep(2); }}
            style={{ 
              padding: '40px', 
              borderRadius: '16px', 
              border: '2px solid #e2e8f0', 
              cursor: 'pointer', 
              textAlign: 'center',
              transition: 'all 0.2s ease',
              background: 'white'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📄</div>
            <h3 style={{ margin: '0', color: '#1e293b' }}>Casual Leave</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px' }}>Short duration leave with substitute arrangements</p>
          </div>

          <div 
            className="type-card"
            onClick={() => { setCategory('EXTENDED'); setStep(2); }}
            style={{ 
              padding: '40px', 
              borderRadius: '16px', 
              border: '2px solid #e2e8f0', 
              cursor: 'pointer', 
              textAlign: 'center',
              transition: 'all 0.2s ease',
              background: 'white'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#db2777'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📅</div>
            <h3 style={{ margin: '0', color: '#1e293b' }}>Extended Leave</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px' }}>Longer duration (Earned, HPL, Medical) without substitute</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-container" style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => setStep(1)} 
        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}
      >
        ← Back to type selection
      </button>

      <div className="form-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', color: category === 'CASUAL' ? '#3b82f6' : '#db2777' }}>
          {category === 'CASUAL' ? 'Casual Leave Application' : 'Extended Leave Application'}
        </h2>

        <form onSubmit={handleSubmit}>
          
          {category === 'EXTENDED' && (
            <div style={{ marginBottom: '25px', background: '#fff1f2', padding: '15px', borderRadius: '8px' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '10px' }}>Select Extended Leave Type</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" value="EARNED" checked={extendedType === 'EARNED'} onChange={() => setExtendedType('EARNED')} /> Earned (Max 7d)
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" value="HPL" checked={extendedType === 'HPL'} onChange={() => setExtendedType('HPL')} /> HPL (Max 8d)
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" value="MEDICAL" checked={extendedType === 'MEDICAL'} onChange={() => setExtendedType('MEDICAL')} /> Medical (Max 7d)
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>From Date</label>
              <input 
                type="date" 
                value={from} 
                min={todayString} 
                onChange={(e) => {
                  setFrom(e.target.value);
                  if (category === 'CASUAL' && durationType === 'HALF') setTo(e.target.value);
                  else if (to && e.target.value > to) setTo('');
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                required 
              />
            </div>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>To Date</label>
              <input 
                type="date" 
                value={to} 
                min={from || todayString} 
                onChange={(e) => setTo(e.target.value)}
                disabled={category === 'CASUAL' && durationType === 'HALF'}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                required 
              />
            </div>
          </div>

          {category === 'CASUAL' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '10px' }}>Leave Duration</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="dur" value="FULL" checked={durationType === 'FULL'} onChange={() => setDurationType('FULL')} /> Full Day
                  </label>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" name="dur" value="HALF" checked={durationType === 'HALF'} onChange={() => { setDurationType('HALF'); if(from) setTo(from); }} /> Half Day
                  </label>
                </div>
              </div>

              {durationType === 'HALF' && (
                <div style={{ marginBottom: '20px', padding: '10px', background: '#eff6ff', borderRadius: '6px' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Select Half Day Period</label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ cursor: 'pointer' }}><input type="radio" value="MORNING" checked={halfDayPeriod === 'MORNING'} onChange={() => setHalfDayPeriod('MORNING')} /> Morning</label>
                    <label style={{ cursor: 'pointer' }}><input type="radio" value="AFTERNOON" checked={halfDayPeriod === 'AFTERNOON'} onChange={() => setHalfDayPeriod('AFTERNOON')} /> Afternoon</label>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Select Substitute</label>
                <select 
                  value={substituteId} 
                  onChange={(e) => setSubstituteId(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Choose available faculty --</option>
                  {substitutes.map(s => <option key={s._id} value={s._id}>{s.name} ({s.facultyCode})</option>)}
                </select>
              </div>
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Reason for Leave</label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              rows="3" 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              required 
            />
          </div>

          {category === 'EXTENDED' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Contact Address</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required 
                />
              </div>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="10-digit mobile"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '15px', 
              background: category === 'CASUAL' ? '#3b82f6' : '#db2777', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 700, 
              fontSize: '1rem', 
              cursor: 'pointer' 
            }}
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeave;
