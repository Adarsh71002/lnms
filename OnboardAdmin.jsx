// OnboardAdmin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardAdminAPI } from '../api/api';

const OnboardAdmin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleOnboardAdmin = async (e) => {
    e.preventDefault();
    try {
      await onboardAdminAPI({ name, email, contactNumber });
      setMessage('Admin onboarded successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Onboard Admin failed');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'hsl(160, 8%, 85%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <form
        onSubmit={handleOnboardAdmin}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Onboard Library Admin</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
            margin: '10px 0',
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
            margin: '10px 0',
          }}
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            margin: '10px 0',
          }}
        />
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#383737',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Onboard Admin
        </button>
      </form>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#383737',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Return to Home Page
      </button>
    </div>
  );
};

export default OnboardAdmin;
