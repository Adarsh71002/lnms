// RaiseRequest.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { raiseIssueRequestAPI } from '../api/api';

const RaiseRequest = () => {
  const [isbn, setIsbn] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRaiseRequest = async (e) => {
    e.preventDefault();
    try {
      await raiseIssueRequestAPI({ ISBN: isbn });
      setMessage('Issue request raised successfully');
      // Optionally, you might clear the input after a successful request:
      setIsbn('');
    } catch (err) {
      setError(err.message || 'Failed to raise issue request');
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
        padding: '20px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <form
        onSubmit={handleRaiseRequest}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        <h2>Raise Issue Request</h2>
        <input
          type="text"
          placeholder="Enter Book ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          required
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
          Raise Issue Request
        </button>
      </form>
      <button
        onClick={() => navigate('/dashboard')}
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
        Return to Dashboard
      </button>
    </div>
  );
};

export default RaiseRequest;
