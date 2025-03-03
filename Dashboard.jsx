// Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    navigate('/');
    return null;
  }
  const user = JSON.parse(storedUser);
  const { Role: role, Name: name } = user;

  // Determine action buttons based on the user's role
  let actionButtons = [];
  if (role === 'Owner') {
    actionButtons.push({
      label: 'Onboard Admin',
      onClick: () => navigate('/onboard-admin'),
    });
  } else if (role === 'LibraryAdmin') {
    actionButtons.push(
      { label: 'Add Book', onClick: () => navigate('/add-book') },
      { label: 'Remove Book', onClick: () => navigate('/remove-book') },
      { label: 'Update Book', onClick: () => navigate('/update-book') },
      { label: 'List Issue Requests', onClick: () => navigate('/issue-requests') }
    );
  } else if (role === 'Reader') {
    actionButtons.push(
      { label: 'Search Book', onClick: () => navigate('/search-book') },
      { label: 'Raise Issue Request', onClick: () => navigate('/raise-request') }
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'hsl(160, 8%, 85%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navbar with role-specific action buttons */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#383737',
          padding: '10px',
        }}
      >
        {actionButtons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            style={{
              margin: '0 10px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </nav>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h2>Dashboard</h2>
        <h3>
          Welcome, {name}! <br />
          You are a: {role}
        </h3>
      </div>

      {/* "Return to Home Page" button fixed at bottom-left */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#383737',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Return to Home Page
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
