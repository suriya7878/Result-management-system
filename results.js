const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Result = require('../models/Result');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// middleware
function auth(requiredRole) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token' });
    const token = header.split(' ')[1];
    try {
      const data = jwt.verify(token, JWT_SECRET);
      if (requiredRole && data.role !== requiredRole) return res.status(403).json({ error: 'Forbidden' });
      req.user = data;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// upload single result (admin only)
router.post('/', auth('admin'), async (req, res) => {
  try {
    const { studentId, studentName, subject, marks } = req.body;
    const grade = calculateGrade(Number(marks));
    const r = new Result({ studentId, studentName, subject, marks, grade });
    await r.save();
    res.json({ ok: true, result: r });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// upload CSV (admin only) - multipart/form-data with file field 'file'
const upload = multer({ dest: 'uploads/' });
router.post('/upload-csv', auth('admin'), upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const text = fs.readFileSync(filePath);
    csv(text, { columns: true, trim: true }, async (err, records) => {
      if (err) return res.status(400).json({ error: err.message });
      const items = records.map(r => ({
        studentId: r.studentId || r.id || r.student_id,
        studentName: r.studentName || r.name || r.student_name,
        subject: r.subject || 'General',
        marks: Number(r.marks || r.score || 0),
        grade: calculateGrade(Number(r.marks || r.score || 0))
      }));
      await Result.insertMany(items);
      fs.unlinkSync(filePath);
      res.json({ ok: true, inserted: items.length });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get results by studentId (client)
router.get('/', auth(), async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ error: 'studentId query required' });
    const results = await Result.find({ studentId }).sort({ createdAt: -1 });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculateGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 75) return 'A';
  if (marks >= 60) return 'B';
  if (marks >= 40) return 'C';
  return 'F';
}

module.exports = router;