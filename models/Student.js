const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
  },
  studentId: {
    type: Number,
    required: true
  },
  roomNumber: {
    type: Number,
    min: 1,
    max: 3,
    required: true
  },
  password: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Student', studentSchema);