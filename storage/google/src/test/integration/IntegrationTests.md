# Running integration tests locally

## Setup

Integration tests require a bucket in Google Cloud that will be used to perform actual file operations. Users can create it using [Google Cloud Console](https://https://console.cloud.google.com//).

To configure backend tests create a `.env` and `token.json` files in `storage/s3/src/test/integration` directory and define values for the following variables:

- `TEST_GOOGLE_BUCKET_NAME` - test bucket name.
- `TEST_GOOGLE_PROJECT_ID` - id of the Google Cloud project.
- `TEST_SECONDARY_GOOGLE_BUCKET_NAME` - name of secondary test bucket.
- `GOOGLE_APPLICATION_CREDENTIALS` - point to token file, e.g. `src/test/integration/token.json`.

## Backend tests

Backend tests test `ClientStorage` and `ServerStorage` provided by this package.

To run them:

- Run the `npm run test:integration:backend` command.
- Launch the "Backend S3 Integration tests" configuration using VS Code.
