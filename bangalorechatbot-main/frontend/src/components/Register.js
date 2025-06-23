// src/components/Register.js
import React, { useState } from 'react';

export default function Register({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful! Please login.');
        setEmail('');
        setPassword('');
        onAuthSuccess(null); // Switch to login
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>
        <input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
