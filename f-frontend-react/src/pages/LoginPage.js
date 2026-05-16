import React, { useState } from 'react';
import API from '../api';

function LoginPage({ onLogin }) {
  const [role, setRole] = useState('FACULTY');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // label and placeholder for the identifier field
  const isAcademic = role !== 'admin';

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;

      if (role === 'admin') {
        response = await fetch(`${API}/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_id: identifier, password }),
          credentials: 'include'
        });
      } else {
        response = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier, password }),
          credentials: 'include'
        });
      }

      const data = await response.json();

      if (response.ok) {
        onLogin(role === 'admin' ? 'admin' : data.role);
      } else {
        setError(data.mssg || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <h2>KITSW Leave Management</h2>
          <h3>Faculty Leave Portal</h3>
        </div>

        <form onSubmit={handleLogin}>
          {/* Role Selector */}
          <div className="form-group">
            <label htmlFor="role">Login As</label>
            <select
              id="role"
              value={role}
              onChange={(e) => { setRole(e.target.value); setIdentifier(''); setError(''); }}
            >
              <option value="FACULTY">Faculty</option>
              <option value="HOD">HOD</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Identifier field */}
          <div className="form-group">
            <label htmlFor="identifier">{isAcademic ? 'Email Address' : 'Admin ID'}</label>
            <input
              id="identifier"
              type={isAcademic ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isAcademic ? 'name@kitsw.ac.in' : 'admin username'}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="err-msg">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
