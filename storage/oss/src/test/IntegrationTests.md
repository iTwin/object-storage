# Running integration tests locally

These integration tests require an bucket in OSS Storage Service that will be used to perform actual file operations. Users can create it using [OSS Console](https://oss.console.aliyun.com/).

1. Create an `.env` file in `storage/oss/src/test` directory and define values for the following variables:
   - `TEST_OSS_BUCKET` - test bucket name.
   - `TEST_OSS_ACCESS_KEY` - OSS storage service access key. 
   - `TEST_OSS_SECRET_KEY` - OSS storage service secret key.
   - `TEST_OSS_BASE_URL` - OSS storage service base url.
   - `TEST_OSS_REGION` - OSS storage service region.
   - `TEST_OSS_STS_BASE_URL` - url of the STS (Security Token Service) that will be called to obtain temporary access token.
   - `TEST_OSS_ROLE_ARN` - ARN (Alibaba Cloud Resource Name) of the OSS storage service role used to obtain a temporary access token from STS.
2. Run the "OSS Integration tests" launch configuration using VS Code.
