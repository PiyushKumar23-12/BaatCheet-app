
````markdown
# Phase 0 – Foundation & Architecture

## Goal

Transform BAATCHEET from a college project into a structured backend with
production-oriented architecture and engineering practices.

---

## Objectives

- Review the existing architecture.
- Establish a Modular Monolith architecture.
- Define clear layer responsibilities.
- Introduce the Service Layer.
- Keep controllers thin.
- Introduce centralized request validation.
- Introduce centralized error handling.
- Introduce asynchronous error handling.
- Establish centralized logging.
- Introduce centralized configuration management.
- Add fail-fast environment validation.
- Establish API documentation using Swagger/OpenAPI.
- Establish a clean and maintainable project structure.
- Perform a final architecture review.

---

# Phase 0 Architecture

The final request flow established during Phase 0 is:

```text
Client
  │
  ▼
Request Logger
  │
  ▼
Route
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
````

Errors follow a centralized path:

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
Global Error Middleware
   │
   ├── Error Logger
   │
   ▼
HTTP Error Response
```

---

# Completed Work

## 1. Architecture Audit

Reviewed the original backend architecture and identified responsibilities
that needed to be separated.

---

## 2. Modular Monolith

Selected **Modular Monolith** as the architectural approach.

The application remains a single deployable application while keeping
business domains and technical responsibilities separated.

---

## 3. Layer Responsibilities

Established clear responsibilities for:

* Routes
* Middleware
* Controllers
* Services
* Models
* Configuration
* Infrastructure utilities
* Validators
* Error handling

---

## 4. Service Layer

Introduced the Service Layer for business logic.

Authentication and messaging business operations are now handled by services.

Examples:

* Register User
* Login User
* Update Profile
* Get Users
* Get Messages
* Send Message

Services are independent of Express request/response objects.

---

## 5. Thin Controllers

Controllers were refactored to focus on HTTP responsibilities.

Controllers now:

* Read request data.
* Call services.
* Return HTTP responses.

Business logic is kept inside services.

---

## 6. Centralized Request Validation

Introduced Zod-based request validation.

Validation is handled through centralized middleware.

Validation covers:

* Request body
* Request parameters
* Request query

Invalid requests are converted into `ValidationError`.

---

## 7. Centralized Error Handling

Introduced a custom application error hierarchy:

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

A Global Error Middleware is responsible for converting errors into HTTP
responses.

---

## 8. Async Error Handling

Introduced `asyncHandler` to bridge rejected Promises from asynchronous
controllers and middleware into Express's error pipeline.

```text
Async Function
     ↓
Rejected Promise
     ↓
asyncHandler
     ↓
next(error)
     ↓
Global Error Middleware
```

This removes the need for repetitive `try/catch` blocks in controllers.

---

## 9. Authentication Refactor

Authentication was refactored around:

* JWT authentication
* Authentication middleware
* Service-based authentication logic
* Zod request validation
* Centralized application errors
* Thin controllers

Authentication errors are represented using appropriate application errors.

---

## 10. Message Module Refactor

The messaging module was refactored using the same architecture.

The module now follows:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Message Service
  ↓
Model / Cloudinary / Socket.IO
```

---

## 11. Logging

Introduced a centralized logger abstraction.

The logger provides:

* `info`
* `warn`
* `error`
* `debug`

Two important logging flows were established.

### Request Logging

```text
Request
  ↓
Request Logger
  ↓
Response
  ↓
Method + URL + Status + Duration
```

### Error Logging

```text
Error
  ↓
Global Error Middleware
  ↓
Error Logger
```

Sensitive information such as passwords, JWTs, cookies, and authorization
headers should not be logged.

---

## 12. Configuration Management

Introduced a centralized configuration layer:

```text
.env
  ↓
dotenv
  ↓
config/env.js
  ↓
Application
```

Application code accesses configuration through the centralized `env` object.

---

## 13. Fail-Fast Configuration Validation

Required environment variables are validated during application startup.

Required configuration includes:

* `MONGODB_URI`
* `JWT_SECRET`
* `CLOUDINARY_CLOUD_NAME`
* `CLOUDINARY_API_KEY`
* `CLOUDINARY_API_SECRET`

If required configuration is missing, the application fails immediately
instead of starting with an invalid configuration.

---

## 14. API Documentation

Introduced:

* `swagger-jsdoc`
* `swagger-ui-express`

Swagger documentation is generated from route-level OpenAPI comments.

Flow:

```text
Route Comments
     ↓
swagger-jsdoc
     ↓
OpenAPI Specification
     ↓
Swagger UI
     ↓
/api-docs
```

Swagger is a documentation layer and is not part of the normal API request
pipeline.

---

## 15. Project Structure

Established the following structure:

```text
src/
├── config/
├── controllers/
├── errors/
├── lib/
├── middleware/
├── models/
├── routes/
├── services/
├── validators/
└── index.js
```

---

# Intentionally Deferred

The following were intentionally **not implemented during Phase 0**.

## Repository Layer

The Repository pattern was considered but intentionally deferred.

Current:

```text
Service
  ↓
Model
  ↓
MongoDB
```

A Repository layer can be introduced later if the project's complexity
justifies the additional abstraction.

---

## Other Deferred Engineering Work

The following belong to later phases:

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

# Final Phase 0 Checklist

* [x] Architecture audit
* [x] Modular Monolith architecture
* [x] Layer responsibilities
* [x] Service Layer
* [x] Thin Controllers
* [x] Authentication refactor
* [x] Message module refactor
* [x] Zod request validation
* [x] Centralized error hierarchy
* [x] Global Error Middleware
* [x] Async error handling
* [x] Request logging
* [x] Error logging
* [x] Configuration management
* [x] Fail-fast configuration validation
* [x] Swagger/OpenAPI setup
* [x] Final architecture review
* [x] Documentation update

---

# Phase 0 Status

## COMPLETE ✅

BAATCHEET now has a structured backend foundation with clear separation of
responsibilities, centralized cross-cutting concerns, and a documented
architecture.

The Repository layer and advanced production infrastructure are intentionally
deferred to later phases rather than being introduced prematurely.