import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validation.middleware.js";

import {
    signupSchema,
    loginSchema,
    updateProfileSchema
} from "../validators/auth.validators.js";


const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Piyush Kumar
 *               email:
 *                 type: string
 *                 format: email
 *                 example: piyush@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request
 *       409:
 *         description: Email already exists
 */
router.post(
    "/signup",
    validate(signupSchema),
    asyncHandler(signup)
);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: piyush@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Invalid credentials
 */
router.post(
    "/login",
    validate(loginSchema),
    asyncHandler(login)
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post(
    "/logout",
    logout
);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Update user profile picture
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profilePic
 *             properties:
 *               profilePic:
 *                 type: string
 *                 description: Image data or image URL
 *                 example: data:image/jpeg;base64,...
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 */
router.put(
    "/update-profile",
    asyncHandler(protectRoute),
    validate(updateProfileSchema),
    asyncHandler(updateProfile)
);

/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user
 *       401:
 *         description: Authentication required
 */
router.get(
    "/check",
    asyncHandler(protectRoute),
    checkAuth
);

export default router;