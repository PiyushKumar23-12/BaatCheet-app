
````markdown
# BAATCHEET - Error Handling Design

## Overview

Error handling is a cross-cutting concern in backend applications.

Instead of handling errors separately in every controller, BAATCHEET follows
a centralized error-handling architecture where application layers throw
meaningful errors and a single Global Error Middleware converts those errors
into HTTP responses.

The main goals are:

- Eliminate repetitive `try/catch` blocks.
- Keep controllers thin.
- Keep services independent of Express.
- Separate business logic from HTTP concerns.
- Provide consistent API error responses.
- Centralize error logging.
- Improve maintainability and debugging.

---

# Error Flow

The normal request flow is:

```text
Client
  │
  ▼
Express Router
  │
  ▼
Middleware
  │
  ├── Authentication
  ├── Validation
  └── Request Logging
  │
  ▼
Controller
  │
  ▼
Service
  │
  ├── Model / Database
  │
  └── External Services
  │
  ▼
HTTP Response
````

When an error occurs:

```text
Any Layer
   │
   ▼
throw / Promise rejection
   │
   ▼
asyncHandler
   │
   ▼
next(error)
   │
   ▼
Global Error Middleware
   │
   ├── Error Logger
   │
   ▼
HTTP Error Response
```

The Global Error Middleware is the central place where errors are converted
into API responses.

---

# Synchronous Exception Propagation

When a synchronous function throws an exception:

* Execution of the current function stops immediately.
* Remaining statements are skipped.
* The exception propagates to the caller.
* This continues until a matching `catch` block is found.
* If nobody catches it, the runtime reports an uncaught exception.

Example:

```javascript
function C() {
    throw new Error("Boom");
}

function B() {
    C();
}

function A() {
    B();
}

A();
```

Call stack:

```text
Main
 │
 ▼
A()
 │
 ▼
B()
 │
 ▼
C()
```

After `throw`:

```text
C() removed
B() removed
A() removed
 │
 ▼
Main
```

This process is called **stack unwinding**.

---

# Asynchronous Exception Propagation

Inside an `async` function:

```javascript
throw new ValidationError("Invalid request");
```

conceptually results in a rejected Promise:

```javascript
return Promise.reject(
    new ValidationError("Invalid request")
);
```

For example:

```javascript
const result = await service();
```

If `service()` returns a rejected Promise:

```text
Rejected Promise
      │
      ▼
     await
      │
      ▼
Thrown Exception
```

The current async function terminates unless the error is caught.

The rejected Promise therefore needs to be forwarded into Express's error
pipeline.

---

# Express 4 Async Error Handling

BAATCHEET uses **Express 4**.

Express 4 does not automatically forward rejected Promises from async route
handlers and middleware to the global error handler.

Therefore BAATCHEET uses an `asyncHandler` wrapper.

```javascript
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };
};
```

The flow is:

```text
Async Controller / Middleware
          │
          ▼
    Promise rejection
          │
          ▼
      asyncHandler
          │
          ▼
       next(error)
          │
          ▼
Global Error Middleware
```

This allows controllers and async middleware to remain free from repetitive
`try/catch` blocks.

---

# Synchronous Middleware

Not every middleware needs `asyncHandler`.

Express 4 automatically catches synchronous exceptions.

For example:

```javascript
export const validate = (schema) => {
    return (req, res, next) => {
        if (...) {
            throw new ValidationError("Invalid request");
        }

        next();
    };
};
```

The synchronous `throw` is caught by Express and forwarded to the error
pipeline.

Therefore:

```text
Sync middleware
    ↓
throw
    ↓
Express
    ↓
Global Error Middleware
```

Whereas async middleware requires:

```text
Async middleware
    ↓
Rejected Promise
    ↓
asyncHandler
    ↓
next(error)
    ↓
Global Error Middleware
```

---

# Application Error Hierarchy

BAATCHEET uses a custom application error hierarchy.

```text
Error
  │
  ▼
AppError
  ├── NotFoundError
  ├── ValidationError
  ├── UnauthorizedError
  ├── ForbiddenError
  └── ConflictError
```

All application errors inherit from `AppError`.

---

# AppError

The base `AppError` class contains common error information.

```javascript
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(
            this,
            this.constructor
        );
    }
}
```

Common properties:

* `message`
* `statusCode`
* `isOperational`
* `stack`

---

# Stack Trace

`Error.captureStackTrace()` is used to provide a cleaner stack trace.

```javascript
Error.captureStackTrace(
    this,
    this.constructor
);
```

This prevents the constructor itself from unnecessarily appearing as the
starting point of the stack trace.

The result is a stack trace that is more useful for debugging.

---

# Specialized Error Classes

Each specialized error class represents a specific application-level
failure.

Examples:

```text
NotFoundError
      ↓
     404
```

```text
ValidationError
      ↓
     400
```

```text
UnauthorizedError
      ↓
     401
```

```text
ForbiddenError
      ↓
     403
```

```text
ConflictError
      ↓
     409
```

Each child class is responsible for choosing its appropriate status code
and providing a sensible default message.

---

# Why Specialized Error Classes?

Instead of:

```javascript
throw new AppError(
    "User not found",
    404
);
```

we prefer:

```javascript
throw new NotFoundError(
    "User not found"
);
```

Benefits:

* Self-documenting code.
* No repeated HTTP status numbers.
* Easier maintenance.
* Better readability.
* Supports `instanceof`.
* Makes the error hierarchy extensible.

---

# Validation Errors

Request validation is handled using Zod.

The validation middleware converts Zod validation failures into a
`ValidationError`.

Example:

```javascript
throw new ValidationError(
    "Invalid request",
    result.error.issues
);
```

The global error middleware can then return:

```json
{
    "success": false,
    "message": "Invalid request",
    "errors": []
}
```

This keeps Zod-specific handling inside the validation layer while the
global error middleware remains responsible for the HTTP response.

---

# Operational vs Unexpected Errors

## Operational Errors

Operational errors represent expected application failures.

Examples:

* User not found
* Validation failed
* Invalid credentials
* Email already exists
* Authentication required
* Invalid or expired token

These errors inherit from `AppError`.

They are safe to expose to the client through controlled messages.

Example:

```javascript
throw new UnauthorizedError(
    "Invalid credentials"
);
```

---

## Unexpected Errors

Unexpected errors indicate failures that the application did not explicitly
anticipate.

Examples:

* `TypeError`
* `ReferenceError`
* Unexpected database errors
* Unexpected Cloudinary errors
* Programmer mistakes
* Infrastructure failures

These errors do not need to be manually converted into `AppError` unless
a layer genuinely understands how to translate them.

The client receives a generic response:

```json
{
    "success": false,
    "message": "Internal Server Error"
}
```

The original error is logged for developers.

---

# Global Error Middleware

The global error middleware is the final error boundary of the Express
request pipeline.

It is registered after all routes:

```javascript
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.use(errorHandler);
```

Its responsibilities are:

1. Receive the error.
2. Log the error.
3. Determine whether it is an operational error.
4. Return the appropriate HTTP response.
5. Hide unexpected internal error details from clients.

Conceptually:

```text
Error
  │
  ▼
Global Error Middleware
  │
  ├── logger.error()
  │
  ├── Operational?
  │      │
  │      ├── YES → Known status + message
  │      │
  │      └── NO  → 500 + generic message
  │
  ▼
HTTP Response
```

---

# Error Logger vs Request Logger

BAATCHEET has two different logging responsibilities.

## Request Logger

The request logger records the request lifecycle.

```text
Request
  ↓
Request Logger
  ↓
Route
  ↓
Response
  ↓
Method + URL + Status + Duration
```

Example:

```text
[INFO] POST /api/auth/login 200 184ms
```

---

## Error Logger

The error logger records errors.

```text
Error
  ↓
Global Error Middleware
  ↓
logger.error()
```

Example:

```text
[ERROR] ValidationError: Invalid request
```

The distinction is:

> **Request Logger → What request happened?**

> **Error Logger → What went wrong?**

The Request Logger is placed before the routes.

The Global Error Middleware is placed after the routes.

---

# When Should Services Catch Errors?

A service should catch an error only when it can:

1. Translate a low-level technical error into a meaningful application
   error.
2. Recover from the failure.
3. Add meaningful business context.
4. Otherwise allow the error to propagate naturally.

---

## Good Example

A low-level database error may represent a business conflict.

```text
Database Error
      │
      ▼
Service understands the meaning
      │
      ▼
ConflictError
      │
      ▼
Global Error Middleware
      │
      ▼
409 Conflict
```

For example:

```text
Duplicate email
      ↓
ConflictError
      ↓
Email already exists
```

The exact translation should only happen when the current layer genuinely
understands the meaning of the low-level error.

---

## Another Good Example

An infrastructure error may be translated if the current layer has enough
context to give it a meaningful application-level interpretation.

```text
External Service Error
      ↓
Meaningful application error
      ↓
Global Error Middleware
```

---

## Bad Example

Do not catch every error simply to replace it with a generic error:

```javascript
try {
    ...
} catch (err) {
    throw new AppError(
        "Something went wrong",
        500
    );
}
```

This hides the original error without adding meaningful information.

The original error may contain valuable debugging information that should
have propagated to the global error handler.

---

# Guiding Principle

> **A layer should catch an exception only if it can add meaningful value.**

The responsibilities are:

```text
Validation Middleware
        ↓
Understands request validation

Authentication Middleware
        ↓
Understands authentication failures

Service
        ↓
Understands business meaning

Global Error Middleware
        ↓
Understands HTTP error responses
```

Unexpected errors can propagate naturally until they reach the global error
middleware.

---

# Example: Login Error Flow

Consider an invalid password.

```text
Client
  │
  ▼
POST /api/auth/login
  │
  ▼
Validation Middleware
  │
  ▼
Controller
  │
  ▼
Login Service
  │
  ├── User found
  │
  ├── Password comparison
  │
  └── Password incorrect
          │
          ▼
   UnauthorizedError
          │
          ▼
    asyncHandler
          │
          ▼
     next(error)
          │
          ▼
 Global Error Middleware
          │
          ├── logger.error()
          │
          ▼
       HTTP 401
```

Response:

```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

---

# Example: Validation Error Flow

```text
Client
  │
  ▼
POST /api/auth/signup
  │
  ▼
Validation Middleware
  │
  ▼
Zod validation fails
  │
  ▼
ValidationError
  │
  ▼
Global Error Middleware
  │
  ├── logger.error()
  │
  ▼
HTTP 400
```

Response:

```json
{
    "success": false,
    "message": "Invalid request",
    "errors": [...]
}
```

---

# Example: Unexpected Error Flow

```text
Client
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Unexpected Error
  │
  ▼
asyncHandler
  │
  ▼
Global Error Middleware
  │
  ├── logger.error(error)
  │
  ▼
HTTP 500
```

Client:

```json
{
    "success": false,
    "message": "Internal Server Error"
}
```

Developer:

```text
Original error
+
Stack trace
+
Debugging information
```

---

# Why This Architecture?

This architecture provides:

### Thin Controllers

Controllers do not need repetitive error handling.

### Transport Independence

Services throw application errors instead of returning HTTP responses.

### Consistent Responses

All API errors pass through the same response formatting layer.

### Centralized Logging

Errors are logged in one place.

### Better Debugging

Unexpected errors preserve their original stack traces.

### Clear Responsibilities

Each layer handles the errors it understands.

---

# Key Takeaways

* Errors propagate by unwinding the call stack.
* `throw` inside an async function results in a rejected Promise.
* `await` observes a rejected Promise as a thrown exception.
* Express 4 requires an async error bridge for rejected Promises.
* `asyncHandler` forwards async errors to `next(error)`.
* Synchronous middleware errors are caught directly by Express.
* Services throw business/application errors, not HTTP responses.
* Controllers remain thin.
* Global Error Middleware converts errors into HTTP responses.
* Specialized error classes improve readability and maintainability.
* Operational errors represent expected application failures.
* Unexpected errors should not expose internal implementation details.
* Errors should only be caught when the current layer can add meaningful
  value.
* Request logging and error logging have different responsibilities.
* The global error middleware is the final error boundary for API errors.

