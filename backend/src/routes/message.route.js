import express from "express";
import { getUsersForSideBar,getMessages,sendMessages } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {messageIdSchema,sendMessageSchema} from "../validators/message.validators.js"
import { validate } from "../middleware/validation.middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router=express.Router();

/**
 * @swagger
 * /api/message/users:
 *   get:
 *     summary: Get all users except the authenticated user
 *     tags:
 *       - Messages
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Authentication required
 */
router.get(
    "/users",
    asyncHandler(protectRoute),
    asyncHandler(getUsersForSideBar)
);

/**
 * @swagger
 * /api/message/{id}:
 *   get:
 *     summary: Get messages between the authenticated user and another user
 *     tags:
 *       - Messages
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to chat with
 *     responses:
 *       200:
 *         description: Conversation messages
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Authentication required
 */
router.get(
    "/:id",
    asyncHandler(protectRoute),
    validate(messageIdSchema),
    asyncHandler(getMessages)
);


/**
 * @swagger
 * /api/message/send/{id}:
 *   post:
 *     summary: Send a message to another user
 *     tags:
 *       - Messages
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the receiver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Hello!
 *               image:
 *                 type: string
 *                 description: Image data or image URL
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 */
router.post(
    "/send/:id",
    asyncHandler(protectRoute),
    validate(sendMessageSchema),
    asyncHandler(sendMessages)
);

export default router;