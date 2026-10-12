# @itwin/object-storage-azure

Copyright © Bentley Systems, Incorporated. All rights reserved. See [LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this package

This package contains implementations for object storage interfaces exposed by `@itwin/object-storage-core` which allow to consume Azure Blob Storage service. Communication with the Blob Service is implemented using using [Azure Storage Blob client library](https://www.npmjs.com/package/@azure/storage-blob).

## Authentication

`AzureServerStorage` supports two kinds of authentication. Both are fully supported.

- **Shared key:** pass `accountKey`. Behavior is unchanged.
- **Token credential:** pass an Azure SDK `TokenCredential` (for example `ManagedIdentityCredential` from `@azure/identity`) as `credential` and omit `accountKey`. Blob operations use the credential. SAS URLs and configs are signed with [user delegation keys](https://learn.microsoft.com/rest/api/storageservices/create-user-delegation-sas).

```ts
const config = { accountName, baseUrl, credential };
const storage = new AzureServerStorage(
  config,
  new BlobServiceClientWrapperFactory().create(config)
);
```

`AzureServerStorageBindings` accepts the same `credential` property. A config that contains `accountKey` always uses shared key, even if it also contains `credential`. There is no fallback between the two kinds.

With a token credential:

- the identity needs blob data access and permission to generate user delegation keys, for example the Storage Blob Data Contributor role on the storage account;
- SAS expiry must be less than 7 days;
- the caller creates and owns the credential.
