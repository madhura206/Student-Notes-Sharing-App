const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: String,
  subject: String,
  description: String,
  file: String,
  uploadedBy: String,   // 👈 owner
  isApproved: {
    type: Boolean,
    default: false   // 👈 important
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Note", noteSchema);
