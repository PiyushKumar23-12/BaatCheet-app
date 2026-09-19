import logger from "../lib/logger.js";

export const errorHandler = (err, req, res, next) => {
    logger.error(err);
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