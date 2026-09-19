### `README.md`

````markdown
# BAATCHEET Backend

Backend service for **BAATCHEET**, a real-time chat application built with
Node.js, Express, MongoDB, Socket.IO, JWT authentication, Cloudinary,
Zod, and Swagger.

---

# Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcryptjs
- Zod
- Cloudinary
- Swagger / OpenAPI
- CORS

---

# Architecture

BAATCHEET follows a **Modular Monolith** architecture.

The application is divided into clear technical layers while keeping
business domains such as Authentication and Messaging separated.

The main goals are:

- Separation of concerns
- Thin controllers
- Business logic inside services
- Centralized validation
- Centralized error handling
- Centralized logging
- Centralized configuration
- Maintainable project structure
- Clear dependency direction

---

# Project Structure

```text
src/
├── config/
│   ├── env.js
│   └── swagger.js
│
├── controllers/
│   ├── auth.controller.js
│   └── message.controller.js
│
├── errors/
│   ├── AppError.js
│   ├── ConflictError.js
│   ├── ForbiddenError.js
│   ├── NotFoundError.js
│   ├── UnauthorizedError.js
│   └── ValidationError.js
│
├── lib/
│   ├── cloudinary.js
│   ├── db.js
│   ├── logger.js
│   ├── socket.js
│   └── utils.js
│
├── middleware/
│   ├── asyncHandler.js
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── requestLogger.middleware.js
│   └── validation.middleware.js
│
├── models/
│   ├── message.model.js
│   └── user.model.js
│
├── routes/
│   ├── auth.route.js
│   └── message.route.js
│
├── services/
│   ├── auth.service.js
│   └── message.service.js
│
├── validators/
│   ├── auth.validators.js
│   └── message.validators.js
│
└── index.js
````

---

# High-Level Request Flow

```text
Client
  │
  ▼
Request Logger
  │
  ▼
Express Route
  │
  ├── Authentication Middleware
  │
  ├── Validation Middleware
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
       ├── Cloudinary
       └── Socket.IO
  │
  ▼
HTTP Response
```

---

# Layer Responsibilities

## Routes

Routes define API endpoints and compose middleware with controllers.

Example:

```text
/api/auth
/api/message
```

Routes should not contain business logic.

---

## Middleware

Middleware handles cross-cutting request concerns.

Current middleware:

* Authentication
* Request validation
* Request logging
* Async error forwarding
* Global error handling

Middleware should not contain business use cases.

---

## Controllers

Controllers handle the HTTP layer.

Responsibilities:

* Read request data
* Call services
* Set HTTP status codes
* Send responses

Controllers should NOT:

* Implement business rules
* Directly perform database operations
* Contain complex business logic

### Flow

```text
Request
   ↓
Controller
   ↓
Service
   ↓
Response
```

Controllers remain thin.

---

## Services

Services contain application business logic.

### Authentication

* Register user
* Login user
* Update profile

### Messaging

* Get users
* Get messages
* Send messages

Services should not know about Express-specific objects:

```text
req
res
next
```

This keeps business logic independent of HTTP.

---

## Models

Models define database structures and provide the persistence interface.

Current models:

```text
User
Message
```

Mongoose is used for MongoDB interaction.

Current flow:

```text
Service
  ↓
Model
  ↓
MongoDB
```

---

# Repository Layer

A Repository layer has intentionally **not** been introduced.

The current application is simple enough for services to interact directly
with Mongoose models.

Repository abstraction is deferred until the project complexity justifies it.

Future possibility:

```text
Service
  ↓
Repository
  ↓
Model
  ↓
MongoDB
```

Current architecture:

```text
Service
  ↓
Model
  ↓
MongoDB
```

---

# Authentication

BAATCHEET uses JWT authentication stored in an HTTP cookie.

## Signup

```text
Client
  ↓
POST /api/auth/signup
  ↓
Validation
  ↓
Controller
  ↓
Auth Service
  ↓
Create User
  ↓
Generate JWT
  ↓
Set Cookie
  ↓
Response
```

## Login

```text
Client
  ↓
POST /api/auth/login
  ↓
Validation
  ↓
Controller
  ↓
Auth Service
  ↓
Verify Credentials
  ↓
Generate JWT
  ↓
Set Cookie
  ↓
Response
```

## Protected Request

```text
Client
  ↓
JWT Cookie
  ↓
protectRoute
  ↓
Verify JWT
  ↓
Find User
  ↓
req.user
  ↓
Controller
  ↓
Service
```

Authentication failures are represented using `UnauthorizedError`.

---

# Validation

Request validation is centralized using **Zod**.

The validation middleware validates:

* `params`
* `body`
* `query`

Flow:

```text
Request
  ↓
Validation Middleware
  ↓
Zod Schema
  │
  ├── Valid
  │     ↓
  │   next()
  │
  └── Invalid
        ↓
   ValidationError
```

Validation schemas are stored in:

```text
src/validators/
```

---

# Error Handling

BAATCHEET uses centralized error handling.

## Error Hierarchy

```text
Error
  │
  ▼
AppError
  ├── ValidationError
  ├── UnauthorizedError
  ├── ForbiddenError
  ├── NotFoundError
  └── ConflictError
```

## Error Flow

```text
Any Layer
    ↓
throw / rejected Promise
    ↓
asyncHandler
    ↓
next(error)
    ↓
Global Error Middleware
    ↓
Error Logger
    ↓
HTTP Response
```

Operational errors return their appropriate HTTP status codes.

Unexpected errors return:

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

# Async Error Handling

Express 4 does not automatically forward rejected promises from async
route handlers.

BAATCHEET uses an `asyncHandler` wrapper.

```text
Async Controller
      ↓
Promise rejection
      ↓
asyncHandler
      ↓
next(error)
      ↓
Global Error Middleware
```

This prevents repetitive `try/catch` blocks in every controller.

---

# Logging

Logging is centralized through:

```text
src/lib/logger.js
```

The logger provides:

* `info`
* `warn`
* `error`
* `debug`

---

## Request Logger

Request logger tracks the HTTP request lifecycle.

```text
Request
  ↓
Request Logger
  ↓
Route
  ↓
Response
  ↓
Log
```

Example:

```text
[INFO] POST /api/auth/login 200 184ms
```

It records:

* HTTP method
* URL
* Status code
* Duration

---

## Error Logger

Errors are logged by the global error middleware.

```text
Error
  ↓
Global Error Middleware
  ↓
logger.error()
  ↓
HTTP Response
```

Sensitive information should never be logged:

* Passwords
* JWT tokens
* Cookies
* Authorization headers
* Sensitive request bodies

---

# Configuration Management

Environment configuration is centralized through:

```text
.env
  ↓
dotenv
  ↓
config/env.js
  ↓
Application
```

Application code accesses configuration through the `env` object.

Example:

```js
env.JWT_SECRET
env.MONGODB_URI
env.PORT
```

Required environment variables:

```text
MONGODB_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

# Fail-Fast Configuration Validation

Required environment variables are validated during application startup.

```text
Application Startup
       ↓
Load .env
       ↓
Validate Configuration
       │
       ├── Invalid → Application stops
       │
       └── Valid → Continue startup
```

This follows the **fail-fast principle**.

The application should not start with missing critical configuration.

---

# External Services

## Cloudinary

Cloudinary handles image uploads.

```text
Controller
    ↓
Service
    ↓
Cloudinary
    ↓
Image URL
    ↓
Database
```

---

## Socket.IO

Socket.IO handles real-time message delivery.

```text
Sender
  ↓
Message Service
  ↓
Save Message
  ↓
Find Receiver Socket
  ↓
Emit newMessage
  ↓
Receiver
```

---

# Database

MongoDB is used as the primary database.

Mongoose is used as the ODM.

Database connection is handled by:

```text
src/lib/db.js
```

The configuration is provided through:

```text
env.MONGODB_URI
```

---

# API Documentation

BAATCHEET uses:

* `swagger-jsdoc`
* `swagger-ui-express`

Swagger documentation is generated from OpenAPI comments placed alongside
the routes.

## Swagger Flow

```text
Route Files
     │
     │ @swagger comments
     ▼
swagger-jsdoc
     ↓
OpenAPI Specification
     ↓
swagger-ui-express
     ↓
/api-docs
     ↓
Swagger UI
```

Swagger is a documentation layer.

It does not sit inside the normal API request pipeline.

Normal API request:

```text
Client
  ↓
Express
  ↓
Middleware
  ↓
Route
  ↓
Controller
  ↓
Service
```

Swagger documentation:

```text
Route Comments
  ↓
swagger-jsdoc
  ↓
OpenAPI Spec
  ↓
Swagger UI
```

Swagger UI is available at:

```text
/api-docs
```

---

# API Endpoints

## Authentication

| Method | Endpoint                   | Description          |
| ------ | -------------------------- | -------------------- |
| POST   | `/api/auth/signup`         | Register a new user  |
| POST   | `/api/auth/login`          | Login                |
| POST   | `/api/auth/logout`         | Logout               |
| PUT    | `/api/auth/update-profile` | Update profile       |
| GET    | `/api/auth/check`          | Check authentication |

## Messages

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/api/message/users`    | Get users for sidebar |
| GET    | `/api/message/:id`      | Get conversation      |
| POST   | `/api/message/send/:id` | Send message          |

---

# Message Flow

## Get Users

```text
Client
  ↓
GET /api/message/users
  ↓
Authentication
  ↓
Controller
  ↓
Message Service
  ↓
User Model
  ↓
Response
```

## Get Messages

```text
Client
  ↓
GET /api/message/:id
  ↓
Authentication
  ↓
Validation
  ↓
Controller
  ↓
Message Service
  ↓
Message Model
  ↓
Response
```

## Send Message

```text
Client
  ↓
POST /api/message/send/:id
  ↓
Authentication
  ↓
Validation
  ↓
Controller
  ↓
Message Service
  ├── Upload image if required
  ├── Save message
  └── Emit Socket.IO event
  ↓
Response
```

---

# Application Startup Flow

```text
Application Starts
       ↓
Load Environment Configuration
       ↓
Validate Required Configuration
       ↓
Initialize Express / Socket.IO
       ↓
Register Middleware
       ↓
Register Swagger
       ↓
Register Routes
       ↓
Register Global Error Handler
       ↓
Start Server
```

---

# Design Principles

BAATCHEET follows:

* Single Responsibility Principle
* Separation of Concerns
* Thin Controllers
* Business Logic inside Services
* Centralized Validation
* Centralized Error Handling
* Centralized Logging
* Centralized Configuration
* Clear Dependency Direction
* Fail-Fast Configuration

---

# Phase 0 Status

## Completed

* Architecture audit
* Modular Monolith architecture
* Layer responsibilities
* Route and middleware separation
* Controller → Service separation
* Thin Controllers
* Service cleanup
* Zod request validation
* Authentication middleware
* Auth module refactor
* Message module refactor
* Error hierarchy
* Centralized error handling
* Async error handling
* Request logging
* Error logging
* Configuration management
* Fail-fast configuration validation
* Swagger/OpenAPI setup
* Final architecture review

## Intentionally Deferred

The following are intentionally deferred to later phases:

* Repository layer
* Advanced database abstraction
* Redis
* Caching
* Pagination
* Search optimization
* Database indexing strategy
* Advanced observability
* Event-driven architecture
* Distributed systems
* Docker
* CI/CD
* Advanced security hardening
* Cloud deployment

---

# Phase 0 Architecture Summary

```text
                         CLIENT
                           │
                           ▼
                   REQUEST LOGGER
                           │
                           ▼
                         ROUTE
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
          AUTHENTICATION         VALIDATION
                 │                   │
                 └─────────┬─────────┘
                           ▼
                      CONTROLLER
                           │
                           ▼
                        SERVICE
                       /       \
                      /         \
                     ▼           ▼
                  MODEL      EXTERNAL
                    │         SERVICES
                    ▼        /        \
                MongoDB  Cloudinary  Socket.IO
```

Cross-cutting concerns:

```text
Configuration   → env.js
Validation      → Zod + Validation Middleware
Authentication  → Auth Middleware
Logging         → Logger + Request Logger
Errors          → Global Error Middleware
API Docs        → Swagger
```

**Phase 0 — Foundation & Architecture: COMPLETE ✅**

