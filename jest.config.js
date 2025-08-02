module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"], // ✅ here
  // ❌ remove any globalSetup/globalTeardown that points to setup.js
};
