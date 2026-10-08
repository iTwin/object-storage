# @itwin/object-storage-minio

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## Deprecated

**This package is deprecated and will be removed in the next major version.** It continues to be published together with the other `@itwin/object-storage-*` packages until then, but is no longer actively maintained.

Use [`@itwin/object-storage-s3`](https://www.npmjs.com/package/@itwin/object-storage-s3) for S3-compatible services. If a service needs specific behavior, extend the classes from that package in your own code.

## About this package

This package contains implementations for object storage interfaces exposed by `@itwin/object-storage-core` which allow to consume [MinIO](https://min.io/) service. This package extends the `@itwin/object-storage-s3` package and adapts it for MinIO use cases using [MinIO JavaScript Library](https://www.npmjs.com/package/minio).
