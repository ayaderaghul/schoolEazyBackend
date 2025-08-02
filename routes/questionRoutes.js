const express = require('express');
const router = express.Router()
const {
  createQuestion,
  randomQuestions,
  getExam,
  scoreExam

} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');
 

router.post('/', createQuestion)
router.get('/random/:count/:level', randomQuestions)
router.get('/exam',protect, getExam)
router.post('/exam',protect, scoreExam)
module.exports = router;