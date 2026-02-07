const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const multer = require("multer");
const path = require("path");

const Note = require("./models/Note");

const app = express();
const fs = require("fs");

app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

console.log("MONGO_URI =", process.env.MONGO_URI);

// 🔴 CONNECT FIRST, THEN START SERVER
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch(err => {
    console.log("MongoDB connection error:", err.message);
  });


// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
  const cleanName = file.originalname.replace(/\s+/g, "_");
  cb(null, Date.now() + "-" + cleanName);
}
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF/DOC files allowed"));
    }
  }
});

// ================= ROUTES =================

app.get("/", (req, res) => {
  res.send("Student Notes Sharing App Backend Running");
});

// Add note
app.post("/add-note", upload.single("file"), async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title,
      subject: req.body.subject,
      description: req.body.description,
      file: req.file.filename,
      uploadedBy: req.body.uploadedBy
    });

    

    await note.save();
    res.redirect("/notes.html");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving note");
  }
});

// Delete note
app.post("/delete-note/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).send("Note not found");
    }

    // 🔐 Authorization check
    if (note.uploadedBy !== req.body.username) {
      return res.status(403).send("You are not allowed to delete this note");
    }

    // 🗑️ Delete file from uploads folder
    const filePath = path.join(__dirname, "uploads", note.file);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("File delete error:", err.message);
      } else {
        console.log("PDF deleted from uploads folder");
      }
    });

    // 🗑️ Delete from MongoDB
    await Note.findByIdAndDelete(req.params.id);

    res.redirect("/notes.html");

  } catch (err) {
    console.log(err);
    res.status(500).send("Delete failed");
  }
});

// Get notes
app.get("/pending-notes", async (req, res) => {
  const notes = await Note.find({ isApproved: false });
  res.json(notes);
});

app.get("/notes", async (req, res) => {
  const notes = await Note.find({ isApproved: true });
  res.json(notes);
});
