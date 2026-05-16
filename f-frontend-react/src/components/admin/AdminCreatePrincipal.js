import React, { useState } from 'react';

const API = 'http://localhost:4000';

function AdminCreatePrincipal({ onDone }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const data = { name, email, password };

    try {
      const response = await fetch(`${API}/admin/principal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();
      if (response.ok) {
        alert('Principal created successfully');
        if (onDone) onDone();
        setName(''); setEmail(''); setPassword('');
      } else {
        alert(result.mssg || 'Failed to create principal');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div>
      <h2>Create Principal Account</h2>
      <div className="form-card admin">
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="principal@kitsw.ac.in"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Assign a secure password"
            required
          />

          <button type="submit" className="btn-submit">Create Principal</button>
        </form>
      </div>
    </div>
  );
}

export default AdminCreatePrincipal;
