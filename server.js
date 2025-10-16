const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB connection
mongoose
  .connect('mongodb://127.0.0.1:27017/result_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// ✅ Models
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String, // "admin" or "student"
});

const resultSchema = new mongoose.Schema({
  studentId: String,
  studentName: String,
  subjectId: String, // changed from "subject" → "subjectId"
  marks: Number,
});

const User = mongoose.model('User', userSchema);
const Result = mongoose.model('Result', resultSchema);

// ✅ Create default admin and student users (once)
const createDefaultUsers = async () => {
  const adminExists = await User.findOne({ email: 'admin@gmail.com' });
  const studentExists = await User.findOne({ email: 'student@gmail.com' });

  if (!adminExists) {
    const hash = await bcrypt.hash('admin123', 10);
    await User.create({ email: 'admin@gmail.com', password: hash, role: 'admin' });
    console.log('✅ Default admin created: admin@gmail.com / admin123');
  }

  if (!studentExists) {
    const hash = await bcrypt.hash('student123', 10);
    await User.create({ email: 'student@gmail.com', password: hash, role: 'student' });
    console.log('✅ Default student created: student@gmail.com / student123');
  }
};
createDefaultUsers();

// ✅ JWT Secret Key
const JWT_SECRET = 'result_management_secret_key';

// ✅ Login route
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email, role });
  if (!user) return res.status(400).json({ msg: 'User not found or wrong role' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user });
});

// ✅ Add or update result
app.post('/api/results', async (req, res) => {
  const { studentId, studentName, subjectId, marks } = req.body;

  if (!studentId || !subjectId)
    return res.status(400).json({ msg: 'Student ID and Subject ID required' });

  let result = await Result.findOne({ studentId, subjectId });
  if (result) {
    result.marks = marks;
    await result.save();
    return res.json({ msg: '✅ Result updated successfully' });
  }

  await Result.create({ studentId, studentName, subjectId, marks });
  res.json({ msg: '✅ Result added successfully' });
});

// ✅ Fetch all results (for admin)
app.get('/api/results', async (req, res) => {
  const results = await Result.find();
  res.json(results);
});

// ✅ Fetch results by student ID (for student)
app.get('/api/results/:studentId', async (req, res) => {
  const results = await Result.find({ studentId: req.params.studentId });
  res.json(results);
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
