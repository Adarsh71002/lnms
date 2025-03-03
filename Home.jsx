import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const goToSignIn = () => navigate('/signin');
  const goToCreateLibrary = () => navigate('/create-library');
  const goToCreateReader = () => navigate('/create-reader');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar with three buttons */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#383737',
          padding: '10px',
        }}
      >
        <button
          onClick={goToSignIn}
          style={{
            margin: '0 10px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
        <button
          onClick={goToCreateLibrary}
          style={{
            margin: '0 10px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Create Library
        </button>
        <button
          onClick={goToCreateReader}
          style={{
            margin: '0 10px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Create Reader
        </button>
      </nav>
      
      {/* Main content area that covers the remaining space */}
      <div
        style={{
          backgroundColor: 'hsl(160, 8%, 85%)',
          flex: 1, // fills remaining vertical space
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 50px',
        }}
      >
        <h1 style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Welcome to Our Library Management System
        </h1>
      </div>
    </div>
  );
};

export default Home;
