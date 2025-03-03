// RemoveBook.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeBookAPI } from '../api/api';

const RemoveBook = () => {
  const [isbn, setIsbn] = useState('');
  const [copiesToRemove, setCopiesToRemove] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRemoveBook = async (e) => {
    e.preventDefault();
    try {
      await removeBookAPI(isbn, { CopiesToRemove: Number(copiesToRemove) });
      setMessage('Book copies removed successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Remove book failed');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'hsl(160, 8%, 85%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <form
        onSubmit={handleRemoveBook}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Remove Book</h2>
        <input
          type="text"
          placeholder="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
            margin: '10px 0',
          }}
        />
        <input
          type="number"
          placeholder="Copies to Remove"
          value={copiesToRemove}
          onChange={(e) => setCopiesToRemove(e.target.value)}
          required
          min="1"
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
          Remove Book
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

export default RemoveBook;
