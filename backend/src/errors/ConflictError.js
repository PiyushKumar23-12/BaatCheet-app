import AppError from "./AppError.js";

class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
    }
}

export default ConflictError;