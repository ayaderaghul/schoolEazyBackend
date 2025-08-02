// tests/studentController.test.js
const request = require("supertest");
const app = require("../app");
const Student = require("../models/Student");

describe("Student Controller API", () => {
  beforeEach(async () => {
    await Student.deleteMany({});
  });

  it("should register a student (POST /api/students/register)", async () => {
    const studentData = {
      username: "janedoe",
      email: "janedoe@example.com",
      password: "mypassword123",
    };

    const res = await request(app)
      .post("/api/students/register") // ✅ use register route
      .send(studentData)
      .expect(201);

    expect(res.body).toHaveProperty("_id");
    expect(res.body.username).toBe(studentData.username);
  });

  it("should return the current student (GET /api/students/me)", async () => {
    // First register
    const studentData = {
      username: 'alice',
      email: "alice@example.com",
      password: "alicepassword",
    };

    const registerRes = await request(app)
      .post("/api/students/register") // ✅ use register route
      .send(studentData)
      .expect(201);

    const loginRes = await request(app)
      .post("/api/students/login")
      .send(studentData);

    const token = loginRes.body.token; // assuming token is returned

    const res = await request(app)
      .get("/api/students/me") // ✅ use correct endpoint
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty("username", "alice");
  });
});
