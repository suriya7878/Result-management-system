import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleFetchResults = async () => {
    if (!studentId) {
      alert('Please enter your Student ID');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/results/${studentId}`);
      if (!res.ok) throw new Error('No results found');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert('Error fetching results. Please check Student ID.');
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      {/* ✅ Small Logout button in top-right corner */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '4px 8px',
          fontSize: '12px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: '#dc3545',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      <h2 style={{ textAlign: 'center', marginTop: '30px' }}>Student Dashboard</h2>

      <input
        type="text"
        placeholder="Enter Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <button onClick={handleFetchResults}>Get Result</button>

      <h3 style={{ marginTop: '20px' }}>Your Results</h3>
      {results.length > 0 ? (
        <table border="1" cellPadding="5" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Subject ID</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.studentId}</td>
                <td>{r.studentName}</td>
                <td>{r.subjectId}</td>
                <td>{r.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}

export default StudentDashboard;
