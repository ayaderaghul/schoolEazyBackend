// middlware/authMiddleware.js

const jwt = require('jsonwebtoken')
const Student = require('../models/Student')

const protect = async(req,res,next) => {
    let token 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET)

            req.student = await Student.findById(decoded.id).select('-password')
            console.log('inside middleware student', req.student)

            if (!req.student) {
                return res.status(401).json({ error: 'Not authorized, user not found' });
                }
            next()
        } catch(error) {
            console.error(error)
            res.status(401)
            throw new Error('not authorized, token failed')
        }
    } else {
        res.status(401)
        throw new Error('not authorized, no token')
    }

}

module.exports = {protect}