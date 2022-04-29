# Running integration tests locally

## Backend tests

Backend tests test `ClientStorage` and `ServerStorage` provided by this package.

To run them:
- Run the `npm run test:integration:backend` command. This script downloads MinIO executable, creates a test bucket and launches MinIO process before running the actual tests. MinIO child process is terminated after test execution. The tests should pass with no additional setup.
- Launch the "Backend MinIO Integration tests (Environment setup and tests)" configuration using VS Code. This configuration runs the `npm run test:integration:backend` script mentioned previously.
- Launch the "Backend MinIO Integration tests (Tests only)" configuration using VS Code. This configuration runs the `test:integration:waitForMinioRunTests` script. Use this configuration if you already have a local MinIO instance running. Note that the tests use hardcoded (mostly default) values for storage configuration so make sure your local instance properties match the ones expected. Test bucket with the name "integration-test" will have to be created manually. Please see [ServerStorageConfigProvider.ts](./ServerStorageConfigProvider.ts) for exact configuration values.

## Frontend tests

Frontend tests test `FrontendStorage` provided by this package.

To run them:
- Run the `npm run test:integration:frontend` command. For more specifics on how the frontend tests are setup see the [frontend tests documentation](../../../../tests/frontend-storage/README.md).
- Launch either the "Frontend MinIO Integration tests (Environment setup and tests)" or "Frontend MinIO Integration tests (Tests only)" configuration using VS Code. This will allow to debug test tools using VS Code and the tests using Chrome. The difference between the two configurations is that the first one sets up the environment and the latter one requires that there is a MinIO instance already running (as also described in the "Backend Tests" section).
  - After Cypress runner opens select the test file you want to debug.
  - Wait for the initial test run to finish.
  - Select "Sources" tab in Chrome Developer Tools
  - Expand `Your spec: '/__cypress/iframes/...'` directory.
  - Find the test source file. Test source files can be found under `webpack://cypress/integration` directory.
  - Place the breakpoint in the test file using Chrome.
  - Refresh the Chrome page to run the test again and the new breakpoint should be hit.

