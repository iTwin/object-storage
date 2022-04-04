# Running integration tests locally

There are two main ways to run integration tests for this package:
1. Using the "MinIO Integration tests (Environment setup and tests)" launch configuration. This script downloads MinIO executable, creates a test bucket and launches MinIO process before running the actual tests. MinIO child process is terminated after test execution. The tests should pass with no additional setup.
2. Using the "MinIO Integration tests (Tests only)" launch configuration. Use this configuration if you already have a local MinIO instance running. Note that the tests use hardcoded (mostly default) values for storage configuration so make sure your local instance properties match the ones expected. Test bucket with the name "integration-test" will have to be created manually. Please see [RunIntegrationTests.ts](./RunIntegrationTests.ts) for exact configuration values.
