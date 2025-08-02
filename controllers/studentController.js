// controllers/studentController.js
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

exports.registerStudent = async(req, res) => {
    const {username, email, password } = req.body

    const studentExists = await Student.findOne({email})
    if (studentExists) {
        res.status(400)
        throw new Error('student already exists')
    } 

    const student = await Student.create({
        username, email, password
    })

    if (student) {
        res.status(201).json({
            _id: student._id,
            username: student.username,
            email: student.email
        })
    } else {
        res.status(400)
        throw new Error('invalid student data')
    }
} 

exports.loginStudent = async(req,res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password'
    });
  }

  try {
    const student = await Student.findOne({ email }).select('+password');
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await student.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(res, student._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: student._id,
        username: student.username,
        email: student.email,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
}

exports.getMe = async(req,res) => {
    const student = await Student.findById(req.student._id).select('-password')

    if(student) {
        res.json(student)
    } else {
        res.status(404)
        throw new Error('student not found')
    }
}

const generateToken = (res, id) => {
    const token = jwt.sign({id}, process.env.SECRET, {
        expiresIn: process.env.EXPIRATION
    })

    return token
}

