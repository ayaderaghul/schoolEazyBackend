module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.js'], // Explicitly look for test files
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000
};