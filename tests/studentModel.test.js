// tests/studentModel.test.js
const mongoose = require('mongoose');
const Student = require('../models/Student');

describe('Student Model', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await Student.deleteMany({});
  });

  it('should save a student with valid fields', async () => {
    const studentData = {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123'
    };

    const student = await Student.create(studentData);
    expect(student._id).toBeDefined();
    expect(student.username).toBe('johndoe');
    expect(student.email).toBe('john@example.com');
    expect(student.password).not.toBe('password123'); // Should be hashed
  });

  it('should fail when required fields are missing', async () => {
    const invalidStudent = {
      username: 'johndoe'
      // Missing email and password
    };

    await expect(Student.create(invalidStudent)).rejects.toThrow();
  });

  it('should not allow duplicate usernames', async () => {
    await Student.create({
      username: 'johndoe',
      email: 'john1@example.com',
      password: 'password123'
    });

    await expect(Student.create({
      username: 'johndoe', // Duplicate username
      email: 'john2@example.com',
      password: 'password123'
    })).rejects.toThrow();
  });
});