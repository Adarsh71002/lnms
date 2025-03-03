// AddBook.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBookAPI } from '../api/api';

const AddBook = () => {
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publisher, setPublisher] = useState('');
  const [version, setVersion] = useState('');
  const [copies, setCopies] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await addBookAPI({
        isbn,
        title,
        authors,
        publisher,
        version,
        copies: Number(copies),
      });
      setMessage('Book added successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Add book failed');
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
        onSubmit={handleAddBook}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Add Book</h2>
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
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
            margin: '10px 0',
          }}
        />
        <input
          type="text"
          placeholder="Authors"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
            margin: '10px 0',
          }}
        />
        <input
          type="text"
          placeholder="Publisher"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            margin: '10px 0',
          }}
        />
        <input
          type="text"
          placeholder="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            margin: '10px 0',
          }}
        />
        <input
          type="number"
          placeholder="Copies"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
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
          Add Book
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

export default AddBook;
