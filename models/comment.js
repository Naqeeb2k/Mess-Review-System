const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: String,
    required: true,
  },
  hostelName:{
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Comment', commentSchema);