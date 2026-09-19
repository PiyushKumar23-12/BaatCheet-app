# BAATCHEET Learnings

---

# Controller

## Responsibility

Controllers belong to the **transport layer**.

Their job is to:

* Receive HTTP requests
* Extract request data
* Call the appropriate service
* Return an HTTP response

Controllers should **not** contain business logic.

---

# Service

## Responsibility

Services contain the application's **business logic**.

A service represents a **use case**, such as:

* Register User
* Login User
* Send Message
* Create Group

Services should not know anything about Express (`req`, `res`, `next`).

Instead, they receive plain JavaScript objects and return plain JavaScript objects.

---

# Repository

## Responsibility

Repositories are responsible only for communicating with the database.

The service should not know whether the application uses MongoDB, PostgreSQL, or another database.

Repositories isolate persistence logic from business logic.

---

# Middleware

Two kinds of middleware will be used.

## Authentication Middleware

Determines who the user is.

Example:

* Verify JWT
* Attach authenticated user to the request

---

## Validation Middleware

Determines whether the incoming request is structurally valid.

Examples:

* Required fields
* Email format
* Image size
* Password length

If validation fails, the request never reaches the controller.

---

## Error Middleware

Provides centralized error handling.

Instead of writing `try/catch` blocks in every controller, errors are forwarded to a single middleware that converts them into consistent HTTP responses.

---

# Request Flow

HTTP Request

↓

Route

↓

Authentication Middleware

↓

Validation Middleware

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Controller

↓

HTTP Response

If an exception occurs, it is handled by the Global Error Middleware.

---

# Key Principles

* Controllers translate HTTP requests into business requests.
* Services implement business use cases.
* Repositories interact with the database.
* Middleware handles cross-cutting concerns.
* Every layer should have a single responsibility.
