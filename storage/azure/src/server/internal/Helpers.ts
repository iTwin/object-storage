/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobSASPermissions,
  ContainerSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export function buildBlobSASParameters(
  containerName: string,
  readOrWrite: "read" | "write",
  expiresOn: Date,
  accountName: string,
  accountKey: string,
  blobName?: string
): string {
  const permissions = new BlobSASPermissions();
  permissions.read = readOrWrite === "read";
  permissions.write = readOrWrite === "write";

  const parameters = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions,
      expiresOn,
    },
    new StorageSharedKeyCredential(accountName, accountKey)
  );
  return parameters.toString();
}

export function buildContainerSASParameters(
  containerName: string,
  expiresOn: Date,
  accountName: string,
  accountKey: string
): string {
  const permissions = getContainerSASPermissions();
  const parameters = generateBlobSASQueryParameters(
    {
      containerName,
      permissions,
      expiresOn,
    },
    new StorageSharedKeyCredential(accountName, accountKey)
  );

  return parameters.toString();
}

function getContainerSASPermissions() {
  const permissions = new ContainerSASPermissions();
  permissions.read = true;
  permissions.write = true;
  permissions.delete = true;
  permissions.list = true;
  permissions.add = true;
  permissions.create = true;
  permissions.move = true;

  return permissions;
}
