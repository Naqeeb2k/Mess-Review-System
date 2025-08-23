const mongoose = require('mongoose');
const Feedback = require('./Feedback');

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
    max: 599,
    required: true
  },
  password: {
    type: String,
    required: true,
  }
});

studentSchema.post("findOneAndDelete", async(student) => {
  if(student){
    await Feedback.deleteMany({owner : student._id});
    console.log("All Feedbacks of this Student are also deleted!");
  }
});

module.exports = mongoose.model('Student', studentSchema);