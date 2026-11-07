import { fileTypeFromBuffer } from "file-type";

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
};
const badRequest = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    error.isOperational = true;
    return error;
};

export const validateImage = async (imageData) => {
    if (typeof imageData !== "string") {
        throw badRequest("Image must be a valid base64 string");
    }

    const match = imageData.match(
        /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/
    );

    if (!match) {
        throw badRequest("Only JPEG, PNG and WebP images are allowed");
    }

    const declaredMime = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length === 0) {
        throw badRequest("Image cannot be empty");
    }

    if (buffer.length > MAX_SIZE) {
        throw badRequest("Image size must not exceed 5 MB");
    }

    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType || detectedType.mime !== declaredMime) {
        throw badRequest("Invalid image content");
    }

    return {
        buffer,
        mimeType: declaredMime,
        extension: ALLOWED_TYPES[declaredMime],
    };
};