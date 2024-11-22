# Running integration tests locally

## Setup

Integration tests require a bucket in Google Cloud that will be used to perform actual file operations. Users can create it using [Google Cloud Console](https://https://console.cloud.google.com//). Tests can work with default application credentials from running `gcloud auth login`.

To configure backend tests create a `.env` file in `storage/google/src/test/integration` directory and define values for the following variables:

- `TEST_GOOGLE_BUCKET_NAME` - test bucket name.
- `TEST_GOOGLE_PROJECT_ID` - id of the Google Cloud project.
- `TEST_SECONDARY_GOOGLE_BUCKET_NAME` - name of secondary test bucket.

## Backend tests

Backend tests test `ClientStorage` and `ServerStorage` provided by this package.

To run them:

- Run the `npm run test:integration:backend` command.
- Launch the "Backend Google Integration tests" configuration using VS Code.
