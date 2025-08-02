const Student = require('../models/Student');

describe('Student Model', () => {
  it('should save a student', async () => {
    const student = await Student.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(student.username).toBe('testuser');
    expect(student.email).toBe('test@example.com');
  });
});