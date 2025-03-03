// IssueRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIssueRequestsAPI, approveIssueRequestAPI, rejectIssueRequestAPI } from '../api/api';

const IssueRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const data = await getIssueRequestsAPI();
      const fetchedRequests = Array.isArray(data.requests) ? data.requests : [];
      setRequests(fetchedRequests);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!loading && requests.length === 0) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, requests, navigate]);

  const handleApprove = async (reqid) => {
    try {
      await approveIssueRequestAPI(reqid);
      fetchRequests();
    } catch (err) {
      setError(err.message || 'Approve failed');
    }
  };
/*
  const handleReject = async (reqid) => {
    try {
      await rejectIssueRequestAPI(reqid);
      fetchRequests();
    } catch (err) {
      setError(err.message || 'Reject failed');
    }
  };*/
  const handleReject = async (reqid) => {
    try {
      await rejectIssueRequestAPI(reqid);
      // Immediately update local state to filter out the rejected request.
      setRequests(prev => prev.filter(r => (r.id || r.ID) !== reqid));
    } catch (err) {
      setError(err.message || 'Reject failed');
    }
  };
  


  // Loading state
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'hsl(160, 8%, 85%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h2>Issue Requests</h2>
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          backgroundColor: 'hsl(160, 8%, 85%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h2>Issue Requests</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  // No requests found state
  if (requests.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'hsl(160, 8%, 85%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h2>Issue Requests</h2>
        <p>No issue requests found.</p>
        <p>Redirecting to Dashboard in 5 seconds...</p>
      </div>
    );
  }

  // Display requests as cards
  return (
    <div style={{ backgroundColor: 'hsl(160, 8%, 85%)', minHeight: '100vh', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Issue Requests</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {requests.map((req) => (
          <div
            key={req.ID || req.id}
            style={{
              backgroundColor: '#fff8e1', // light creamish color
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <p>
              <strong>Request ID:</strong> {req.ID || req.id}
            </p>
            <p>
              <strong>Book ISBN:</strong> {req.BookID || req.book_id}
            </p>
            <p>
              <strong>Reader ID:</strong> {req.ReaderID || req.reader_id}
            </p>
            <p>
              <strong>Request Date:</strong>{' '}
              {new Date(req.RequestDate || req.request_date).toLocaleDateString()}
            </p>
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => handleApprove(req.ID || req.id)}
                style={{
                  marginRight: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#383737',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(req.ID || req.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#383737',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#383737',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default IssueRequests;
