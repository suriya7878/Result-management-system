import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    subjectId: '',
    marks: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const res = await fetch('http://localhost:5000/api/results');
    const data = await res.json();
    setResults(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.msg);
    setForm({ studentId: '', studentName: '', subjectId: '', marks: '' });
    fetchResults();
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

      <h2 style={{ textAlign: 'center', marginTop: '30px' }}>Admin Dashboard</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <input
          type="text"
          name="studentId"
          placeholder="Student ID"
          value={form.studentId}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="studentName"
          placeholder="Student Name"
          value={form.studentName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="subjectId"
          placeholder="Subject ID"
          value={form.subjectId}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="marks"
          placeholder="Marks"
          value={form.marks}
          onChange={handleChange}
          required
        />
        <button type="submit">Add / Update Result</button>
      </form>

      <h3 style={{ marginTop: '20px' }}>All Results</h3>
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
    </div>
  );
}

export default AdminDashboard;
