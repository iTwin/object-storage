/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export function buildSASParameters(
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
