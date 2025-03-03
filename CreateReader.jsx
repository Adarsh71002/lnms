// CreateReader.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReaderAPI, getLibrariesAPI } from '../api/api';

const CreateReader = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [libId, setLibId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [libraries, setLibraries] = useState([]);
  const navigate = useNavigate();

  // Function to fetch libraries from API
  const fetchLibraries = async () => {
    try {
      const data = await getLibrariesAPI();
      // Assume API returns an object like { libraries: [...] }
      const libs = Array.isArray(data.libraries) ? data.libraries : [];
      setLibraries(libs);
    } catch (err) {
      console.error('Failed to fetch libraries', err);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  const handleCreateReader = async (e) => {
    e.preventDefault();
    try {
      await createReaderAPI({
        name,
        email,
        contactNumber,
        lib_id: Number(libId)
      });
      setMessage('Reader created successfully');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Reader creation failed');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'hsl(160, 8%, 85%)',
        minHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* Reader Creation Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '40px'
        }}
      >
        <h2>Create Reader</h2>
        <form
          onSubmit={handleCreateReader}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: '10px',
              margin: '10px 0',
              fontSize: '16px'
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
              margin: '10px 0',
              fontSize: '16px'
            }}
          />
          <input
            type="text"
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            style={{
              padding: '10px',
              margin: '10px 0',
              fontSize: '16px'
            }}
          />
          <input
            type="number"
            placeholder="Library ID"
            value={libId}
            onChange={(e) => setLibId(e.target.value)}
            required
            style={{
              padding: '10px',
              margin: '10px 0',
              fontSize: '16px'
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
              cursor: 'pointer'
            }}
          >
            Create Reader
          </button>
        </form>
      </div>

      {/* Libraries Display Section */}
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Libraries</h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'center'
          }}
        >
          {libraries.map((library) => (
            <div
              key={library.id}
              style={{
                backgroundColor: '#fff8e1', // light creamish color
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                width: '250px'
              }}
            >
              <p>
                <strong>Library Name:</strong> {library.name}
              </p>
              <p>
                <strong>Library ID:</strong> {library.id}
              </p>
              <p>
                <strong>Number of Books:</strong> {library.numBooks}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateReader;
