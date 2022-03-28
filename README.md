# Cloud Agnostic Object Storage Libraries

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this Repository

This repository contains packages that expose a unified cloud-agnostic object storage interface.

- [`@itwin/cloud-agnostic-core`](./cloud-agnostic/core/README.md) is a base package that allows to load different components into an application using `inversify` based on the configuration.
- [`@itwin/object-storage-core`](./storage/core/README.md) package defines main interfaces for object storage.
- The following packages provide implementations of interfaces defined in `@itwin/object-storage-core` for specific cloud object storage providers:
  - [`@itwin/object-storage-azure`](./storage/azure/README.md) contains an implementation for Microsoft Azure.
  - [`@itwin/object-storage-s3`](./storage/s3/README.md) contains base implementation for S3-compatible storage providers. The following packages extend this package and adapt it to specific providers:
    - [`@itwin/object-storage-oss`](./storage/oss/README.md) contains an implementation for OSS.
    - [`@itwin/object-storage-minio`](./storage/minio/README.md) contains an implementation for MinIO.

This repository also contains packages that are relevant only for development:
- [`@itwin/object-storage-tests`](./tests/object-storage/README.md) contains integration tests that can be run using different storage implementations.
- [`@itwin/object-storage-common-config`](./utils/common-config/README.md) is a collection of various configuration files shared across the packages in this monorepo.

## Build Instructions

1. Clone repository (first time) with `git clone` or pull updates to the repository (subsequent times) with `git pull`
2. Install dependencies: `rush install`
3. Clean: `rush clean`
4. Rebuild source: `rush rebuild`

### Running Tests
- `rush test` command runs unit tests for all packages that have unit tests. The tests should pass with no additional setup.
- `rush test:integration` command runs integration tests for packages that have them. Please see the `IntegrationTests.md` files for instructions specific to each package.
