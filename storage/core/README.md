# @itwin/object-storage-core

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this package

This package defines core interfaces for object storage. It exposes two main interfaces: `ServerStorage` and `ClientStorage`. `ServerStorage` is intended to be used by services that use object storage po persist data that is later accessed by the service clients using `ClientStorage`.

Package users can choose and either use storage abstractions as normal interfaces/classes or they can register and load them into applications as dependencies (see `ServerStorageDependency`, `ClientStorageDependency`). See the `@itwin/object-storage-tests` package in this repository for an example on how to register storage interfaces and bind implementations, `StorageIntegrationTests.ts` module models minimal application startup class.
