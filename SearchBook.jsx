// SearchBook.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchBooksAPI, raiseIssueRequestAPI } from '../api/api';

const SearchBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await searchBooksAPI({ title, author, publisher });
      setResults(data.books || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseRequest = async (isbn) => {
    try {
      await raiseIssueRequestAPI({ ISBN: isbn });
      alert('Issue request raised successfully!');
    } catch (err) {
      alert(err.message || 'Failed to raise issue request');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'hsl(160, 8%, 85%)',
        minHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* Centered Search Form */}
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center'
        }}
      >
        <h2>Search Book</h2>
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              margin: '10px 0'
            }}
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              margin: '10px 0'
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
              margin: '10px 0'
            }}
          />
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
            Search
          </button>
        </form>
        {loading && <p style={{ marginTop: '20px' }}>Loading...</p>}
        {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
      </div>

      {/* Search Results as Cards */}
      {results.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'center',
            marginTop: '20px'
          }}
        >
          {results.map((book) => (
            <div
              key={book.isbn}
              style={{
                backgroundColor: '#fff8e1', // light creamish color
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                width: '250px'
              }}
            >
              <p>
                <strong>ISBN:</strong> {book.isbn}
              </p>
              <p>
                <strong>Title:</strong> {book.title}
              </p>
              <p>
                <strong>Authors:</strong> {book.authors}
              </p>
              <p>
                <strong>Publisher:</strong> {book.publisher}
              </p>
              <p>
                <strong>Version:</strong> {book.version}
              </p>
              <p>
                <strong>Total Copies:</strong> {book.total_copies}
              </p>
              <p>
                <strong>Available Copies:</strong> {book.available_copies}
              </p>
              <button
                onClick={() => handleRaiseRequest(book.isbn)}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#383737',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Raise Issue Request
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Return to Dashboard Button */}
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
          cursor: 'pointer'
        }}
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default SearchBook;
