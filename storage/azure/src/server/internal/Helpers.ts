/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobSASPermissions,
  BlobSASSignatureValues,
  ContainerSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
  UserDelegationKey,
} from "@azure/storage-blob";

import type {
  AzureBlobServiceConfig,
  AzureBlobServiceCredentialConfig,
} from "../wrappers";

/**
 * A config selects token credential authentication only when it has a
 * `credential` property and no `accountKey` property. Any config with
 * `accountKey` uses shared key authentication.
 */
export function isCredentialConfig(
  config: AzureBlobServiceConfig | AzureBlobServiceCredentialConfig
): config is AzureBlobServiceCredentialConfig {
  return "credential" in config && !("accountKey" in config);
}

export function buildBlobSASParameters(
  containerName: string,
  readOrWrite: "read" | "write",
  expiresOn: Date,
  accountName: string,
  signingKey: StorageSharedKeyCredential | UserDelegationKey,
  blobName?: string
): string {
  const permissions = new BlobSASPermissions();
  permissions.read = readOrWrite === "read";
  permissions.write = readOrWrite === "write";

  return signSASParameters(
    {
      containerName,
      blobName,
      permissions,
      expiresOn,
    },
    accountName,
    signingKey
  );
}

export function buildContainerSASParameters(
  containerName: string,
  expiresOn: Date,
  accountName: string,
  signingKey: StorageSharedKeyCredential | UserDelegationKey
): string {
  const permissions = getContainerSASPermissions();
  return signSASParameters(
    {
      containerName,
      permissions,
      expiresOn,
    },
    accountName,
    signingKey
  );
}

function signSASParameters(
  values: BlobSASSignatureValues,
  accountName: string,
  signingKey: StorageSharedKeyCredential | UserDelegationKey
): string {
  const parameters =
    signingKey instanceof StorageSharedKeyCredential
      ? generateBlobSASQueryParameters(values, signingKey)
      : generateBlobSASQueryParameters(values, signingKey, accountName);

  return parameters.toString();
}

function getContainerSASPermissions() {
  const permissions = new ContainerSASPermissions();
  permissions.read = true;
  permissions.write = true;
  permissions.delete = true;
  permissions.list = true;

  return permissions;
}
