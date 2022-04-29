# Running integration tests locally

## Setup

Integration tests require a bucket in OSS Storage Service that will be used to perform actual file operations. Users can create it using [OSS Console](https://oss.console.aliyun.com/).

To configure both backend and frontend tests create a `.env` file in `storage/oss/src/test` directory and define values for the following variables:
- `TEST_OSS_BUCKET` - test bucket name.
- `TEST_OSS_ACCESS_KEY` - OSS storage service access key. 
- `TEST_OSS_SECRET_KEY` - OSS storage service secret key.
- `TEST_OSS_BASE_URL` - OSS storage service base url.
- `TEST_OSS_REGION` - OSS storage service region.
- `TEST_OSS_STS_BASE_URL` - url of the STS (Security Token Service) that will be called to obtain temporary access token.
- `TEST_OSS_ROLE_ARN` - ARN (Alibaba Cloud Resource Name) of the OSS storage service role used to obtain a temporary access token from STS.

## Backend tests

Backend tests test `ClientStorage` and `ServerStorage` provided by this package.

To run them:
- Run the `npm run test:integration:backend` command.
- Launch the "Backend OSS Integration tests" configuration using VS Code.

## Frontend tests

Frontend tests test `FrontendStorage` provided by this package.

To run them:
- Run the `npm run test:integration:frontend` command. For more specifics on how the frontend tests are setup see the [frontend tests documentation](../../../../tests/frontend-storage/README.md).
- Launch the "Frontend OSS Integration tests" configuration using VS Code. This will allow to debug test tools using VS Code and the tests using Chrome.
  - After Cypress runner opens select the test file you want to debug.
  - Wait for the initial test run to finish.
  - Select "Sources" tab in Chrome Developer Tools
  - Expand `Your spec: '/__cypress/iframes/...'` directory.
  - Find the test source file. Test source files can be found under `webpack://cypress/integration` directory.
  - Place the breakpoint in the test file using Chrome.
  - Refresh the Chrome page to run the test again and the new breakpoint should be hit.

