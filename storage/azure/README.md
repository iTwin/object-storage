# @itwin/object-storage-azure

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this package

This package contains implementations for object storage interfaces exposed by `@itwin/object-storage-core` which allow to consume Azure Blob Storage service. Communication with the Blob Service is implemented using using [Azure Storage Blob client library](https://www.npmjs.com/package/@azure/storage-blob).

## Authentication

`AzureServerStorage` and `AzureServerStorageBindings` authenticate with either `accountKey` (shared key) or an Azure SDK `TokenCredential` passed as `credential`. If the config has an `accountKey` property, even an undefined or empty one, shared key is used; omit the property to use `credential`. With a token credential, SAS URLs and configs are signed with [user delegation keys](https://learn.microsoft.com/rest/api/storageservices/create-user-delegation-sas).

```ts
const config = { accountName, baseUrl, credential };
const storage = new AzureServerStorage(
  config,
  new BlobServiceClientWrapperFactory().create(config)
);
```

The identity needs blob data access and permission to generate user delegation keys, for example the Storage Blob Data Contributor role. SAS expiry must not exceed the user delegation key's expiry, about 7 days minus 5 minutes from now.
