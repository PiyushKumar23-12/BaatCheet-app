# BAATCHEET Backend Testing

This document describes the automated testing setup used in the BAATCHEET backend.

## Tools

- Vitest: Runs the test suite and provides `describe`, `it`, and `expect` for organizing tests and checking results.
- Supertest: Sends HTTP requests to the Express application to test API routes without starting a separate server.
- MongoMemoryServer: Starts a temporary MongoDB instance for database-dependent tests, keeping the existing Docker MongoDB database isolated.
- Mongoose: Connects application models to the temporary test database.

## Test Coverage

The current test suite covers:

- A basic assertion test.
- Signup, login, and profile validation schemas.
- Signup API rejection for an invalid email.
- Login API rejection for an empty password.
- Successful signup using the temporary MongoDB database.
- Protected authentication routes rejecting requests without a token.
- Protected authentication routes rejecting an invalid JWT.

The test suite currently contains 13 passing tests. Run the tests again to verify the current result.

## Run the Tests

From the `backend` directory, run:

```
npm install
npm test -- --run
```

The `--run` flag tells Vitest to execute all discovered tests once and exit instead of staying in watch mode.

## Temporary Database Lifecycle

The integration tests use Vitest lifecycle hooks:

- `beforeAll()` starts MongoMemoryServer and connects Mongoose to the temporary database before the tests run.
- Test execution runs the database-dependent tests against the temporary database.
- `afterAll()` disconnects Mongoose and stops the temporary server.

This prevents these tests from using or modifying the existing Docker MongoDB database. MongoMemoryServer may need to download a MongoDB binary the first time it runs.

## Example Test Structure

```
describe("Auth API validation", () => {
  it("should reject signup with an invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "Piyush",
        email: "invalid-email",
        password: "password123",
      });

    expect(response.status).toBe(400);
  });
});
```

- `describe()` groups related tests.
- `it()` defines an individual test case.
- `request(app)` targets the Express application.
- `.post()` specifies the HTTP method and route.
- `.send()` provides the request body.
- `expect()` asserts that the actual result matches the expected result.

## Notes and Limitations

- The current tests provide a foundation, not exhaustive coverage of every API or edge case.
- Separate tests for expired and not-yet-valid JWTs have not yet been added.
- Additional tests can cover login outcomes, duplicate signup, authorization, and message APIs.
- Keep secrets and production database credentials out of test files and version control.