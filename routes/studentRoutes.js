// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getMe
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Register a new student
router.post('/register', registerStudent);

// Login student
router.post('/login', loginStudent);

// Get logged-in student profile
router.get('/me', protect, getMe);

module.exports = router;