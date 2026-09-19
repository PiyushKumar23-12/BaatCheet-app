import AppError from "./AppError.js";

class ValidationError extends AppError {
    constructor(message = "Validation failed", issues = []) {
        super(message, 400);
        this.issues = issues;
    }
}

export default ValidationError;