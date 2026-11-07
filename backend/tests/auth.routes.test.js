
import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
    beforeEach,
    vi
} from "vitest";

import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../src/app.js";
import User from "../src/models/user.model.js";
import Message from "../src/models/message.model.js";
import env from "../src/config/env.js";

import cloudinary from "../src/lib/cloudinary.js";

let mongoServer;
let sender;
let receiver;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri("baatcheet_test"));

    vi.spyOn(cloudinary.uploader, "upload").mockResolvedValue({
        secure_url: "https://example.com/test-image.jpg"
    });
}, 30000);

beforeEach(async () => {
    await User.deleteMany({});
    await Message.deleteMany({});

    sender = await User.create({
        fullName: "Sender",
        email: "sender@example.com",
        password: "hashedpassword",
    });

    receiver = await User.create({
        fullName: "Receiver",
        email: "receiver@example.com",
        password: "hashedpassword",
    });

    token = jwt.sign(
        { userId: sender._id },
        env.JWT_SECRET,
        { expiresIn: "7d" }
    );
});

afterAll(async () => {
    vi.restoreAllMocks();

    await mongoose.disconnect();

    if (mongoServer) {
        await mongoServer.stop();
    }
});


// --------------------------------------------------
// AUTH API TESTS
// --------------------------------------------------

describe("Auth API validation", () => {

    it("should reject signup with invalid email", async () => {
        const response = await request(app)
            .post("/api/auth/signup")
            .send({
                fullName: "Piyush",
                email: "invalid-email",
                password: "password123",
            });

        expect(response.status).toBe(400);
    });

    it("should reject login with empty password", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "piyush@example.com",
                password: "",
            });

        expect(response.status).toBe(400);
    });

    it("should signup with correct details", async () => {
        const response = await request(app)
            .post("/api/auth/signup")
            .send({
                fullName: "Piyush",
                email: "piyush12@example.com",
                password: "password123",
            });

        expect(response.status).toBe(201);
    });

});


// --------------------------------------------------
// AUTHENTICATION TESTS
// --------------------------------------------------

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

    it("should reject invalid JWT token", async () => {
        const response = await request(app)
            .get("/api/auth/check")
            .set("Cookie", "jwt=invalid.token.value");

        expect(response.status).toBe(401);
    });

});


// --------------------------------------------------
// MESSAGE AUTHENTICATION TESTS
// --------------------------------------------------

describe("Message Authentication", () => {

    it("should reject message without JWT", async () => {
        const response = await request(app)
            .post(`/api/message/send/${receiver._id}`)
            .send({
                text: "Hello"
            });

        expect(response.status).toBe(401);
    });

    it("should reject message with invalid JWT", async () => {
        const response = await request(app)
            .post(`/api/message/send/${receiver._id}`)
            .set("Cookie", "jwt=invalid.token.value")
            .send({
                text: "Hello"
            });

        expect(response.status).toBe(401);
    });

});


// --------------------------------------------------
// MESSAGE REQUEST VALIDATION TESTS
// --------------------------------------------------

describe("Message Request Validation", () => {

    it("should reject invalid receiver ID", async () => {
        const response = await request(app)
            .post("/api/message/send/invalid-id")
            .set("Cookie", `jwt=${token}`)
            .send({
                text: "Hello"
            });

        expect(response.status).toBe(400);
    });

    it("should reject empty message", async () => {
        const response = await request(app)
            .post(`/api/message/send/${receiver._id}`)
            .set("Cookie", `jwt=${token}`)
            .send({});

        expect(response.status).toBe(400);
    });

    it("should reject whitespace-only text", async () => {
        const response = await request(app)
            .post(`/api/message/send/${receiver._id}`)
            .set("Cookie", `jwt=${token}`)
            .send({
                text: "   "
            });

        expect(response.status).toBe(400);
    });

});


// --------------------------------------------------
// MESSAGE SERVICE TESTS
// --------------------------------------------------

describe("Message API", () => {

    it("should send a valid text message", async () => {
        const response = await request(app)
            .post(`/api/message/send/${receiver._id}`)
            .set("Cookie", `jwt=${token}`)
            .send({
                text: "Hello Receiver"
            });

        expect(response.status).toBe(201);
        expect(response.body).toBeDefined();

        const savedMessage = await Message.findOne({
            senderId: sender._id,
            receiverId: receiver._id
        });

        expect(savedMessage).not.toBeNull();
        expect(savedMessage.text).toBe("Hello Receiver");
    });

    it("should reject an invalid image", async () => {
        const response = await request(app)
            .post(`/api/message/send/${receiver._id}`)
            .set("Cookie", `jwt=${token}`)
            .send({
                image: "not-a-valid-image"
            });

        expect(response.status).toBe(400);
        expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
    });

    it("should reject an image larger than 5 MB", async () => {
        const largeImage = `data:image/jpeg;base64,${Buffer.alloc(
            5 * 1024 * 1024 + 1
        ).toString("base64")}`;

        const response = await request(app)
            .post(`/api/message/send/${receiver._id}`)
            .send({
                image: largeImage
            })
            .set("Cookie", `jwt=${token}`);

        expect(response.status).toBe(400);
        expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
    });

});


// --------------------------------------------------
// RATE LIMITING TESTS
// --------------------------------------------------

describe("Auth Rate Limiting", () => {

    it("should block requests after the configured limit", async () => {
        const responses = [];

        for (let i = 0; i < 11; i++) {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "piyush@example.com",
                    password: "password123"
                });

            responses.push(response.status);
        }

        expect(responses).toContain(429);
    });

});
