import logger from "../lib/logger.js";

export const errorHandler = (err, req, res, next) => {
    logger.error(err);

    
    if (
        err.name === "JsonWebTokenError" ||
        err.name === "TokenExpiredError" ||
        err.name === "NotBeforeError"
    ) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.issues && { errors: err.issues })
        });
    }
    
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};