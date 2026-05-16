import React, { useState, useEffect } from 'react';
import API from '../../api';

function AdminOfflineLeave() {
  const [departments, setDepartments] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);

  const [departmentId, setDepartmentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  
  const [category, setCategory] = useState('CASUAL');
  const [extendedType, setExtendedType] = useState('EARNED');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);

  // Casual specific
  const [durationType, setDurationType] = useState('FULL');
  const [halfDayPeriod, setHalfDayPeriod] = useState('MORNING');
  const [substituteId, setSubstituteId] = useState('');

  useEffect(() => {
    fetchBaseData();
  }, []);

  async function fetchBaseData() {
    try {
      console.log('Fetching Admin Offline Leave base data...');
      const [deptRes, facRes] = await Promise.all([
        fetch(`${API}/admin/departments`, { credentials: 'include' }),
        fetch(`${API}/admin/faculty`, { credentials: 'include' })
      ]);
      
      if (deptRes.ok) {
        const d = await deptRes.json();
        console.log('Departments loaded:', d);
        setDepartments(Array.isArray(d) ? d : []);
        if (Array.isArray(d) && d.length > 0) {
            setDepartmentId(d[0]._id);
        }
      } else {
        console.error('Failed to load departments:', deptRes.status);
      }
      
      if (facRes.ok) {
        const f = await facRes.json();
        console.log('Faculty loaded:', f);
        setAllFaculty(Array.isArray(f) ? f : []); 
      } else {
        console.error('Failed to load faculty:', facRes.status);
      }
    } catch (err) {
      console.error('Network error loading base data:', err);
    }
  }

  useEffect(() => {
    if (departmentId && Array.isArray(allFaculty)) {
      const filtered = allFaculty.filter(f => {
          const fDeptId = f.departmentId?._id || f.departmentId;
          return String(fDeptId) === String(departmentId);
      });
      console.log(`Filtered faculty for dept ${departmentId}:`, filtered);
      setFilteredFaculty(filtered);
      if (filtered.length > 0) {
        if (!filtered.find(f => String(f._id) === String(facultyId))) {
           setFacultyId(filtered[0]._id);
        }
      } else {
        setFacultyId('');
      }
    } else {
      setFilteredFaculty([]);
      setFacultyId('');
    }
  }, [departmentId, allFaculty]);

  // Fetch substitutes when dates change for Casual leave
  useEffect(() => {
    if (category === 'CASUAL' && departmentId && facultyId && from && to) {
      fetchSubstitutes(from, to);
    } else {
      setSubstitutes([]);
    }
  }, [from, to, category, departmentId, facultyId]);

  async function fetchSubstitutes(startDate, endDate) {
    try {
      const response = await fetch(`${API}/admin/availableSubstitutes?departmentId=${departmentId}&facultyId=${facultyId}&from=${startDate}&to=${endDate}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSubstitutes(data);
        if (data.length > 0) setSubstituteId(data[0]._id);
        else setSubstituteId('');
      }
    } catch (err) {
      console.error('Error fetching substitutes:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!facultyId || !from || !to || !reason || !file) {
      alert('All fields and the paper application photo are required');
      return;
    }

    if (category === 'CASUAL' && !substituteId) {
       alert('Substitute selection is mandatory for Casual Leave.');
       return;
    }

    const formData = new FormData();
    formData.append('facultyId', facultyId);
    formData.append('category', category);
    formData.append('extendedLeaveType', category === 'EXTENDED' ? extendedType : 'N/A');
    formData.append('from', from);
    formData.append('to', to);
    formData.append('reason', reason);
    formData.append('document', file);
    
    if (category === 'CASUAL') {
        formData.append('durationType', durationType);
        if (durationType === 'HALF') formData.append('halfDayPeriod', halfDayPeriod);
        formData.append('substituteId', substituteId);
    }

    try {
      const response = await fetch(`${API}/admin/offline-leave`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.mssg);
        // Reset form partially
        setFrom('');
        setTo('');
        setReason('');
        setFile(null);
        if (document.getElementById('fileInput')) document.getElementById('fileInput').value = '';
      } else {
        alert(data.mssg || 'Failed to submit offline leave');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="form-card admin-offline" style={{ maxWidth: '700px' }}>
      <h3>Log Offline Leave (Approved on Paper)</h3>
      <p className="info-text">Use this to record leaves that were already approved manually. This will automatically deduct the faculty's leave balance.</p>
      
      <form onSubmit={handleSubmit}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ fontWeight: 600 }}>Select Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
              <option value="">-- Choose Dept --</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Select Faculty</label>
            <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
              {filteredFaculty.length === 0 ? <option value="">-- No Faculty Found --</option> : null}
              {filteredFaculty.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.facultyCode})</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ fontWeight: 600 }}>Leave Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
              <option value="CASUAL">Casual Leave</option>
              <option value="EXTENDED">Extended Leave</option>
            </select>
          </div>
          {category === 'EXTENDED' && (
            <div>
              <label style={{ fontWeight: 600 }}>Extended Type</label>
              <select value={extendedType} onChange={(e) => setExtendedType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
                <option value="EARNED">Earned Leave</option>
                <option value="HPL">Half Pay Leave</option>
                <option value="MEDICAL">Medical Leave</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ fontWeight: 600 }}>From Date</label>
            <input 
                type="date" 
                value={from} 
                onChange={(e) => {
                    setFrom(e.target.value);
                    if (category === 'CASUAL' && durationType === 'HALF') setTo(e.target.value);
                }} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px' }} 
            />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>To Date</label>
            <input 
                type="date" 
                value={to} 
                min={from || todayString}
                onChange={(e) => setTo(e.target.value)} 
                disabled={category === 'CASUAL' && durationType === 'HALF'}
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px' }} 
            />
          </div>
        </div>

        {category === 'CASUAL' && (
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Leave Duration</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" value="FULL" checked={durationType === 'FULL'} onChange={() => setDurationType('FULL')} /> Full Day
                  </label>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="radio" value="HALF" checked={durationType === 'HALF'} onChange={() => { setDurationType('HALF'); if(from) setTo(from); }} /> Half Day
                  </label>
                </div>
              </div>

              {durationType === 'HALF' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Half Day Period</label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ cursor: 'pointer' }}><input type="radio" value="MORNING" checked={halfDayPeriod === 'MORNING'} onChange={() => setHalfDayPeriod('MORNING')} /> Morning</label>
                    <label style={{ cursor: 'pointer' }}><input type="radio" value="AFTERNOON" checked={halfDayPeriod === 'AFTERNOON'} onChange={() => setHalfDayPeriod('AFTERNOON')} /> Afternoon</label>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Select Substitute</label>
                <select 
                  value={substituteId} 
                  onChange={(e) => setSubstituteId(e.target.value)} 
                  required={category === 'CASUAL'} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                >
                  <option value="">-- Choose available faculty --</option>
                  {substitutes.map(s => <option key={s._id} value={s._id}>{s.name} ({s.facultyCode})</option>)}
                </select>
                {!from && <small style={{ color: '#64748b' }}>Select dates first to see available substitutes.</small>}
              </div>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 600 }}>Reason (from paper app)</label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            placeholder="Reason for leave..." 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', minHeight: '80px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 600 }}>Upload Scan/Photo of Application</label>
          <input 
            id="fileInput"
            type="file" 
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files[0])} 
            required 
            style={{ width: '100%', padding: '10px' }}
          />
        </div>

        <button type="submit" className="btn-submit" style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', borderRadius: '6px', fontWeight: 700 }}>
          Record & Approve Offline Leave
        </button>
      </form>
    </div>
  );
}

export default AdminOfflineLeave;
