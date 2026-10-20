
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri("baatcheet_test"));
}, 30000);






describe("Auth API validation", () => {
  it("should reject signup with an invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "Piyush",
        email: "invalid-email",
        password: "password123",
      });

    expect(response.status).toBe(400);
  });

  it("should reject login with an empty password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "piyush@example.com",
        password: "",
      });

    expect(response.status).toBe(400);
  });
});


describe("It should signup with correct details",()=>{
    it("It should signup with correct details",async()=>{
        const response = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "Piyush",
        email: "piyush12@example.com",
        password: "password123",
      });

    expect(response.status).toBe(201);
    })
});


describe("Protected Auth API", () => {
  it("should reject check route without authentication", async () => {
    const response = await request(app)
      .get("/api/auth/check");

    expect(response.status).toBe(401);
  });

  it("should reject profile update without authentication", async () => {
    const response = await request(app)
      .put("/api/auth/update-profile")
      .send({
        profilePic: "https://example.com/profile.jpg",
      });

    expect(response.status).toBe(401);
  });

  
it("should reject an invalid JWT token", async () => {
  const response = await request(app)
    .get("/api/auth/check")
    .set("Cookie", "jwt=invalid.token.value");

  expect(response.status).toBe(401);
});

});


afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});