# @itwin/object-storage-minio

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this package

This package contains implementations for object storage interfaces exposed by `@itwin/object-storage-core` which allow to consume [MinIO](https://min.io/) service. This package extends the `@itwin/object-storage-s3` package and adapts it for MinIO use cases using [MinIO JavaScript Library](https://www.npmjs.com/package/minio).

## Integration tests

Integration test scripts for this package setup the local environment before running the actual tests.
Users can launch integration tests using the following scripts:
- `npm run test:integration` will download the MinIO executable based on local operating system, then start the MinIO server and tests.
- `test:integration:startMinioRunTests` will only start the MinIO server and tests (without the executable download). This is the script that is used by "MinIO Integration tests" `.vscode` configuration to reduce debugging session startup time so make sure that the executable is downloaded before launching the session. MinIO executable can be downloaded using the `npm run test:integration:downloadMinio` script.
