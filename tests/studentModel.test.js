// tests/studentModel.test.js
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

describe("Student Model", () => {
  it("should save a student with valid fields", async () => {
    const studentData = {
      username: "johndoe",
      email: "johndoe@example.com",
      password: "securepassword123",
    };

    const student = new Student(studentData);
    const savedStudent = await student.save();

    expect(savedStudent._id).toBeDefined();
    expect(savedStudent.username).toBe(studentData.username);
    expect(savedStudent.email).toBe(studentData.email);

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(studentData.password, savedStudent.password);
    expect(isMatch).toBe(true);
  });
});
