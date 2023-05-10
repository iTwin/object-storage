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
- [`@itwin/object-storage-tests-backend-unit`](./tests//backend-storage-unit/README.md) contains unit tests for different object storage implementations.
- [`@itwin/object-storage-tests-backend`](./tests/backend-storage/README.md),\
  [`@itwin/object-storage-tests-frontend`](./tests/frontend-storage/README.md) contain integration tests that can be run using different storage implementations.
- [`@itwin/object-storage-common-config`](./utils/common-config/README.md) is a collection of various configuration files shared across the packages in this monorepo.

## Build Instructions

Local development workflows mostly utilize `rush` commands which run a specific `npm` script for each package. For exact script definitions in each package see the corresponding `package.json` files.

1. Clone repository (first time) with `git clone` or pull updates to the repository (subsequent times) with `git pull`
2. Install dependencies: `rush install`
3. Clean: `rush clean`
4. Rebuild source: `rush rebuild`

### Running Tests

- `rush test:unit` command runs unit tests for all packages that have unit tests. The tests should pass with no additional setup.
- `rush test:integration:backend` and `rush test:integration:frontend` commands run integration tests for packages that have them. Please see the `IntegrationTests.md` files for instructions specific to each package.

## Usage examples

There are two main ways how to consume the storage packages in applications:
1. Using the provided classes/interfaces directly and managing their creation manually.
1. Loading them using the provided dependency injection configuration utilities. This option utilizes `inversify` framework and allows injecting configured storage classes into other application components.

There are two samples of minimal applications that achieve the same thing (download a file using `ClientStorage`) and each demonstrate a different method for managing application components:
1. Without `inversify` - [App.ts](./samples/src/client-file-download/without-inversify/App.ts), [Run.ts](./samples/src/client-file-download/without-inversify/Run.ts) (launch using "Client file download with DI sample" VS Code configuration). The application constructs classes directly.
1. With `inversify` - [App.ts](./samples/src/client-file-download/with-inversify/App.ts), [Run.ts](./samples/src/client-file-download/with-inversify/Run.ts) (launch using "Client file download without DI sample" VS Code configuration). The application uses `inversify`\`s `Container` to manage component lifetime. Note that the advantages of dependency injection become more apparent when working with larger applications. This method is also used in [integration test setup](tests/object-storage/src/StorageIntegrationTests.ts).
