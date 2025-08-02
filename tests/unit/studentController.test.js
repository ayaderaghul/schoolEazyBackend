// tests/unit/studentController.test.js
const { loginStudent } = require('../../controllers/studentController');
const httpMocks = require('node-mocks-http');

// Mock Student model
jest.mock('../../models/Student', () => ({
  findOne: jest.fn().mockImplementation((query) => {
    if (query.username === 'testuser') {
      return {
        select: jest.fn().mockResolvedValue({
          _id: '1',
          username: 'testuser',
          email: 'test@example.com',
          matchPassword: jest.fn().mockResolvedValue(true)
        })
      };
    }
    return null;
  })
}));

describe('Student Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginStudent', () => {
    it('should return token for valid credentials', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/students/login',
        body: {
          username: 'testuser',
          password: 'password123'
        }
      });
      const res = httpMocks.createResponse();

      await loginStudent(req, res);
      const responseData = res._getJSONData();

      expect(res.statusCode).toBe(200);
      expect(responseData).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/students/login',
        body: {
          username: 'nonexistent',
          password: 'password123'
        }
      });
      const res = httpMocks.createResponse();

      await loginStudent(req, res);

      expect(res.statusCode).toBe(401);
    });
  });
});