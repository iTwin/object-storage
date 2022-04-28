# Running integration tests locally

## Setup

Integration tests require an Azure Blob Storage account to perform actual file operations. Users can create it using [Azure Portal](https://portal.azure.com/).

To configure both backend and frontend tests create an `.env` file in `storage/azure/src/test/integration` directory and define values for the following variables:
   - `TEST_AZURE_STORAGE_ACCOUNT_NAME` - test Azure storage account name.
   - `TEST_AZURE_STORAGE_ACCOUNT_KEY` - test Azure storage account key.
   - `TEST_AZURE_STORAGE_BASE_URL` - test Azure storage account base url. Usually will be equal to something like `https://<YOUR_ACCOUNT_NAME>.blob.core.windows.net`.

## Backend tests

Backend tests test `ClientStorage` and `ServerStorage` provided by this package.

To run them:
- Run `npm run  

## Frontend tests
2. Run the "Azure Integration tests" launch configuration using VS Code.
