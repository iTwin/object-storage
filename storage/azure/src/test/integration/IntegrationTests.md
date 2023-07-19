# Running integration tests locally

## Setup

Integration tests require an Azure Blob Storage account to perform actual file operations. Users can create it using [Azure Portal](https://portal.azure.com/).

To configure both backend and frontend tests create a `.env` file in `storage/azure/src/test/integration` directory and define values for the following variables:

- `TEST_AZURE_STORAGE_ACCOUNT_NAME` - test Azure storage account name.
- `TEST_AZURE_STORAGE_ACCOUNT_KEY` - test Azure storage account key.
- `TEST_AZURE_STORAGE_BASE_URL` - test Azure storage account base url. Usually will be equal to something like `https://<YOUR_ACCOUNT_NAME>.blob.core.windows.net`.
- `TEST_SECONDARY_AZURE_STORAGE_ACCOUNT_NAME` - secondary test Azure storage account name (used for testing copying, can be the same as the first account if not testing cross-region copying)
- `TEST_SECONDARY_AZURE_STORAGE_ACCOUNT_KEY` - secondary test Azure storage account key.
- `TEST_SECONDARY_AZURE_STORAGE_BASE_URL` - secondary test Azure account base url.

## Backend tests

Backend tests test `ClientStorage` and `ServerStorage` provided by this package.

To run them:

- Run the `npm run test:integration:backend` command.
- Launch the "Backend Azure Integration tests" configuration using VS Code.

## Frontend tests

Frontend tests test `FrontendStorage` provided by this package.

To run them:

- Run the `npm run test:integration:frontend` command. For more specifics on how the frontend tests are setup see the [frontend tests documentation](../../../../../tests/frontend-storage/README.md).
- Launch the "Frontend Azure Integration tests" configuration using VS Code. This will allow to debug test tools using VS Code and the tests using Chrome.
  - After Cypress runner opens select the test file you want to debug.
  - Wait for the initial test run to finish.
  - Select "Sources" tab in Chrome Developer Tools
  - Expand `Your spec: '/__cypress/iframes/...'` directory.
  - Find the test source file. Test source files can be found under `webpack://cypress/integration` directory.
  - Place the breakpoint in the test file using Chrome.
  - Refresh the Chrome page to run the test again and the new breakpoint should be hit.
