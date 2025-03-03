// CreateLibrary.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLibraryAPI } from '../api/api';

const CreateLibrary = () => {
  const [libraryName, setLibraryName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleCreateLibrary = async (e) => {
    e.preventDefault();
    try {
      await createLibraryAPI({ libraryName, ownerName, ownerEmail, ownerContact });
      setMessage('Library created successfully');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Library creation failed');
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
        onSubmit={handleCreateLibrary}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '400px',
          gap: '10px',
        }}
      >
        <input
          type="text"
          placeholder="Library Name"
          value={libraryName}
          onChange={(e) => setLibraryName(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
          }}
        />
        <input
          type="text"
          placeholder="Owner Name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
          }}
        />
        <input
          type="email"
          placeholder="Owner Email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
          }}
        />
        <input
          type="text"
          placeholder="Owner Contact"
          value={ownerContact}
          onChange={(e) => setOwnerContact(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
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
          Create Library
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

export default CreateLibrary;
