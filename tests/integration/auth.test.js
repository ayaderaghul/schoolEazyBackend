// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');

describe('Auth API', () => {
  beforeAll(async () => {
    await Student.deleteMany({});
  });

  describe('POST /register', () => {
    it('should register a new student', async () => {
      const res = await request(app)
        .post('/api/students/register')
        .send({
          username: 'janedoe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('username', 'janedoe');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 400 for duplicate username', async () => {
      await request(app)
        .post('/api/students/register')
        .send({
          username: 'johndoe',
          email: 'john1@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/students/register')
        .send({
          username: 'johndoe', // Duplicate
          email: 'john2@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/students/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/students/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/students/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});