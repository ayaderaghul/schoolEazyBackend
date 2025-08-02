const Question = require('../models/Question');
const Student = require('../models/Student')

exports.createQuestion = async(req, res) => {
try {
        const question = new Question({
            ...req.body
        })
        await question.save()
        res.status(201).send(question)
    }catch(err) {
        res.status(400).send({error: err.message})
    }
}

exports.randomQuestions = async(req, res) => {
    try {
        const count = parseInt(req.params.count)
        const level = req.params.level.toUpperCase()
        console.log('inside randomquestion controller', count, level)

        if (isNaN(count) || count < 1) {
      return res.status(400).json({
        error: 'Invalid count parameter',
        message: 'Count must be a positive integer',
        example: '/api/questions/random/5/E'
      });
    }

    if (!['E', 'M', 'H'].includes(level)) { // Adjust allowed levels as needed
      return res.status(400).json({
        error: 'Invalid difficulty level',
        message: 'Level must be one of: E, M, H',
        example: '/api/questions/random/5/E'
      });
    }

    // Debug: Check what levels actually exist in DB
    const existingLevels = await Question.distinct('level');
    console.log('Existing levels in DB:', existingLevels);

    // Check if we have any questions at this level
    const totalAtLevel = await Question.countDocuments({ level: level });
    console.log(`Found ${totalAtLevel} questions at level ${level}`);

    if (totalAtLevel === 0) {
      return res.status(404).json({
        error: 'No questions found',
        message: `Found 0 questions at level '${level}'`,
        existingLevels: existingLevels,
        suggestion: 'Check if level exists in: ' + existingLevels.join(', ')
      });
    }

    // Get random questions
    const questions = await Question.aggregate([
      { $match: { level: level } },
      { $sample: { size: count } }
    ]);

    // Handle case where we got fewer questions than requested
    if (questions.length < count) {
      return res.status(200).json({
        warning: `Database contains only ${questions.length} '${level}' questions (requested ${count})`,
        actualCount: questions.length,
        requestedCount: count,
        level,
        questions,
        suggestion: questions.length === 0 ? 
          'Add more questions to the database' : 
          'Request a smaller number of questions'
      });
    }

    // Successful response
    res.json({
      success: true,
      count: questions.length,
      level,
      questions
    });

  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({
      error: 'Server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
 
exports.getExam = async(req,res) => {
    // Debugging: Log the entire request
  console.log('Request headers:', req.headers);
  console.log('Request user:', req.student);
  
  if (!req.student?.id) {
    console.error('User not authenticated or missing ID');
    return res.status(401).json({ 
      error: 'Authentication failed',
      details: 'User information missing from request' 
    });
  }

  try {
    console.log('inside trycatch questioncontroller')
    // Get student's average score from previous exams (0-10 scale)
    const studentId = req.student.id;
    const { averageScore } = await Student.findById(studentId)
      .select('score')
      .lean();

    // Determine difficulty distribution based on score
    let difficultyDistribution;
    if (averageScore <= 5) {
      // Weak student: 70% Easy, 25% Medium, 5% Hard
      difficultyDistribution = { E: 0.7, M: 0.25, H: 0.05 };
    } else if (averageScore <= 8) {
      // Average student: 30% Easy, 50% Medium, 20% Hard
      difficultyDistribution = { E: 0.3, M: 0.5, H: 0.2 };
    } else if (averageScore <= 10) {
      // Strong student: 10% Easy, 30% Medium, 60% Hard
      difficultyDistribution = { E: 0.1, M: 0.3, H: 0.6 };
    } else {
      difficultyDistribution = { E: 0.7, M: 0.25, H: 0.05 };
    }

    // Exam configuration
    const examConfig = {
      totalQuestions: 7,
      difficultyDistribution,
      timeLimit: 60 // minutes
    };

    // Calculate number of questions per difficulty
    const questionsByDifficulty = {};
    for (const [level, percentage] of Object.entries(difficultyDistribution)) {
      questionsByDifficulty[level] = Math.round(examConfig.totalQuestions * percentage);
    }

    // Adjust for rounding errors
    const total = Object.values(questionsByDifficulty).reduce((a, b) => a + b, 0);
    if (total !== examConfig.totalQuestions) {
      questionsByDifficulty.E += examConfig.totalQuestions - total;
    }

    // Fetch questions for each difficulty
    const examQuestions = [];
    for (const [level, count] of Object.entries(questionsByDifficulty)) {
      if (count > 0) {
        const questions = await Question.aggregate([
          { $match: { level: level } },
          { $sample: { size: count } }
        ]);
        examQuestions.push(...questions);
      }
    }

    // Shuffle questions
    const shuffledQuestions = examQuestions.sort(() => 0.5 - Math.random());

    // Return exam without answers
    res.json({
      exam: {
        studentLevel: getStudentLevel(averageScore),
        averageScore,
        difficultyDistribution,
        totalQuestions: shuffledQuestions.length,
        timeLimit: examConfig.timeLimit,
        questions: shuffledQuestions.map(q => ({
          id: q._id,
          questionText: q.content,
          difficulty: q.level,
          options:  q.options.map(opt => ({ text: opt })) 
        }))
      }
    });

  } catch (err) {
    console.error('Exam generation error:', err);
    res.status(500).json({
      error: 'Exam generation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper function to determine student level
function getStudentLevel(score) {
  if (score <= 5) return 'E';
  if (score <= 7) return 'M';
  if (score <= 10) return 'H';
  return 'E';
}


exports.scoreExam = async(req,res) =>{
  try {
    const { answers } = req.body;
    
    // 1. Get all questions with correct answers
    const questionIds = Object.keys(answers);
    const questions = await Question.find({
      _id: { $in: questionIds }
    }).select('+options.isCorrect');

    // 2. Calculate score
    let correctCount = 0;
    questions.forEach(q => {
      const selectedOptionIndex = answers[q._id];
      if (q.options[selectedOptionIndex]?.isCorrect) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 10); // 0-10 scale

    // 3. Update student's average score
    await Student.findByIdAndUpdate(
      req.student._id,
      { 
        $set: { 
          lastScore: score,
          averageScore: calculateNewAverage(req.student.averageScore, score) 
        } 
      }
    );

    res.json({ 
      success: true,
      score,
      correctCount,
      totalQuestions: questions.length
    });

  } catch (err) {
    console.error('Exam submission error:', err);
    res.status(500).json({ error: 'Exam submission failed' });
  }


}

function calculateNewAverage(currentAverage, newScore) {
  if (!currentAverage) return newScore;
  return Math.round((currentAverage + newScore) / 2);
}