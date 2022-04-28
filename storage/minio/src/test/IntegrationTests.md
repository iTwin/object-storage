# Running integration tests locally

## Backend tests

Backend tests test `ClientStorage` and `ServerStorage` provided by this package.

There are two main ways to run backend integration tests:
- Run `npm run test:integration:backend` command. This script downloads MinIO executable, creates a test bucket and launches MinIO process before running the actual tests. MinIO child process is terminated after test execution. The tests should pass with no additional setup.
- Launch the "MinIO Integration tests (Environment setup and tests)" configuration using VS Code. This configuration runs the `npm run test:integration:backend` script mentioned previously.
- Launch the "MinIO Integration tests (Tests only)" configuration using VS Code. This configuration runs the `test:integration:waitForMinioRunTests` script. Use this configuration if you already have a local MinIO instance running. Note that the tests use hardcoded (mostly default) values for storage configuration so make sure your local instance properties match the ones expected. Test bucket with the name "integration-test" will have to be created manually. Please see [RunIntegrationTests.ts](./RunIntegrationTests.ts) for exact configuration values.

## Frontend tests

Frontend tests test `FrontendStorage` provided by this package.

To run them:
- Run `npm run test:integration:frontend` command. For more specifics on how the frontend tests are setup see the [frontend tests documentation](../../../../tests/frontend-storage/README.md).
