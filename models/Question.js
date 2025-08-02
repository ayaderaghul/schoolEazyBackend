const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'question content is required'],
        trim: true
    },
    options: [{
        type: String
    }],
    answer: {
        type: String,
        required: true
    },
    topics: [{
        type: String
    }],
    level: {
        type: String,
        enum: ['E', 'M', 'H'] // easy medium hard
    }
},{timestamps: true})

const Question = mongoose.model('Question', questionSchema)
module.exports = Question