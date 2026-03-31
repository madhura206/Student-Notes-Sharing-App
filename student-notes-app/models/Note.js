const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: String,
  subject: String,
  description: String,
  file: String,
  uploadedBy: String, 
  isApproved: {
    type: Boolean,
    default: false   
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Note", noteSchema);
