import React, { useState, useEffect } from 'react';
import API from '../../api';

function AdminCreateHOD({ onDone }) {
  const [departments, setDepartments] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [allHods, setAllHods] = useState([]);
  
  const [departmentId, setDepartmentId] = useState('');
  const [facultyId, setFacultyId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [deptRes, facRes, hodRes] = await Promise.all([
        fetch(`${API}/admin/departments`, { credentials: 'include' }),
        fetch(`${API}/admin/faculty`, { credentials: 'include' }),
        fetch(`${API}/admin/hod`, { credentials: 'include' })
      ]);
      
      if (deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d);
        if (d.length > 0) setDepartmentId(d[0]._id);
      }
      
      if (facRes.ok) {
        const f = await facRes.json();
        // Fallback for API returning a message object if empty array
        setAllFaculty(Array.isArray(f) ? f : []); 
      }
      
      if (hodRes.ok) {
        const h = await hodRes.json();
        setAllHods(Array.isArray(h) ? h : []);
      }
    } catch (err) {
      console.error('Failed to load data');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!departmentId || !facultyId) {
      alert('Please select both a department and a faculty member.');
      return;
    }

    if (!window.confirm("Are you sure? This will demote any existing HOD for this department back to regular faculty.")) {
        return;
    }

    const data = { departmentId, facultyId };

    try {
      const response = await fetch(`${API}/admin/hod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.mssg || 'HOD assigned successfully');
        if (onDone) onDone();
      } else {
        alert(result.mssg || 'Failed to assign HOD');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  const deptFaculty = allFaculty.filter(f => f.departmentId?._id === departmentId);
  const currentHOD = allHods.find(h => h.departmentId?._id === departmentId);

  return (
    <div>
      <h2>Assign HOD</h2>
      <div className="form-card admin">
        <form onSubmit={handleSubmit}>
          
          <label>Select Department</label>
          <select 
            value={departmentId} 
            onChange={(e) => { 
                setDepartmentId(e.target.value); 
                setFacultyId(''); // reset faculty selection when dept changes
            }}
            required
          >
            {departments.length === 0 && <option value="">Loading / None available...</option>}
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>

          {currentHOD && (
             <div style={{ padding: '12px', background: '#fef3c7', color: '#92400e', borderRadius: '6px', marginTop: '14px', fontSize: '13px', border: '1px solid #fde68a' }}>
               <strong>Current HOD:</strong> {currentHOD.name} ({currentHOD.facultyCode})
               <br/>Assigning a new HOD will revert them to regular faculty.
             </div>
          )}

          <label>Select Faculty</label>
          <select 
            value={facultyId} 
            onChange={(e) => setFacultyId(e.target.value)}
            required
            disabled={!departmentId || deptFaculty.length === 0}
          >
            <option value="">-- Select a Faculty Member --</option>
            {deptFaculty.map(f => (
              <option key={f._id} value={f._id}>{f.name} ({f.facultyCode})</option>
            ))}
          </select>
          {departmentId && deptFaculty.length === 0 && (
             <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>No regular faculty available in this department.</p>
          )}

          <button type="submit" className="btn-submit" disabled={!facultyId}>Assign as HOD</button>
        </form>
      </div>
    </div>
  );
}

export default AdminCreateHOD;
