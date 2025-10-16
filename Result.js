const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: String,
  subject: String,
  marks: Number,
  grade: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);