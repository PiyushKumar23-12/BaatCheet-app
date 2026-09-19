# ADR-001: Adopt a Modular Monolith Architecture

## Status

Accepted

## Date

July 2026

## Context

BAATCHEET started as a college project. As new features such as group chats, notifications, caching, event-driven processing, and cloud deployment are added, the existing layer-based structure will become difficult to maintain.

## Decision

BAATCHEET will use a **Modular Monolith** architecture.

The application will be organized by **features** rather than only technical layers. Business logic will reside in services, database access in repositories, and HTTP handling in controllers.

## Alternatives Considered

### Layer-Based Architecture

**Pros**

* Simple to understand
* Suitable for small projects

**Cons**

* Features become scattered across multiple folders
* Harder to scale and maintain

### Microservices

**Pros**

* Independent deployment
* Independent scaling

**Cons**

* Operational complexity
* Distributed systems challenges
* Not justified for the current stage of BAATCHEET

## Consequences

### Positive

* Better separation of concerns
* Easier feature development
* Improved maintainability
* Easier testing
* Smooth path toward future scaling

### Negative

* More files and folders
* Slightly higher initial setup cost

## Future Review

Revisit this decision if BAATCHEET evolves into multiple independently deployable services.
