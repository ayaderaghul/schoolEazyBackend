// app.js

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
dotenv.config()

const app = express()

connectDB()

app.use(express.json())
app.use(cors())


app.get('/', (req,res) => {
    res.send('student auth api')
})

app.use('/api/students', require('./routes/studentRoutes'))

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('something broke')
})

// Export the app for testing
module.exports = app;

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}