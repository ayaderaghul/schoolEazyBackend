const Student = require('../models/Student');

module.exports = {
  createTestStudent: async (studentData = {}) => {
    return await Student.create({
      username: 'testStudent',
        email: 'test@example.com',
      password: 'password123',
      ...studentData
    });
  }
};