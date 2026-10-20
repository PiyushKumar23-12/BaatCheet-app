import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema, updateProfileSchema } from "../src/validators/auth.validators.js";

describe("Signup Schema", () => {
    it("should accept valid signup data", () => {
        const result = signupSchema.safeParse({
            body: {
                fullName: "Piyush",
                email: "piyush@example.com",
                password: "password123"
            }
        });

        expect(result.success).toBe(true);
    });

    it("should reject an invalid email", () => {
        const result = signupSchema.safeParse({
            body: {
                fullName: "Piyush",
                email: "invalid-email",
                password: "password123"
            }
        });

        expect(result.success).toBe(false);
    });

    it("should reject a password shorter than 6 characters", () => {
        const result = signupSchema.safeParse({
            body: {
                fullName: "Piyush",
                email: "piyush@example.com",
                password: "123"
            }
        });

        expect(result.success).toBe(false);
    });

});

describe("Login Schema", () => {
    it("should accept valid login data", () => {
        const result = loginSchema.safeParse({
            body: {
                email: "piyush@example.com",
                password: "password123"
            }
        });

        expect(result.success).toBe(true);
    });

    it("should reject an empty password", () => {
        const result = loginSchema.safeParse({
            body: {
                email: "piyush@example.com",
                password: ""
            }
        });

        expect(result.success).toBe(false);
    });

});

describe("Update Profile Schema", () => {
    it("should reject an empty profile picture", () => {
        const res = updateProfileSchema.safeParse({
            body: {
                profilePic: ""
            }
        });
        expect(res.success).toBe(false);
    });

});
