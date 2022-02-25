/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

import {
  assertTypeAndValue,
  FalsyValueError,
} from "@itwin/cloud-agnostic-core";
import {
  buildObjectKey,
  ConfigDownloadInput,
  ConfigUploadInput,
  ObjectReference,
  TransferConfig,
} from "@itwin/object-storage-core";

import { AzureTransferConfig } from ".";

export function assertAzureTransferConfig(
  transferConfig: TransferConfig | AzureTransferConfig
): asserts transferConfig is AzureTransferConfig {
  assertTypeAndValue(transferConfig, "transferConfig", "object");

  if (!("authentication" in transferConfig))
    throw new FalsyValueError("transferConfig.authentication");
  assertTypeAndValue(
    transferConfig.authentication,
    "transferConfig.authentication",
    "string"
  );
}

export function buildBlobUrlFromConfig(
  input: ConfigDownloadInput | ConfigUploadInput
): string {
  const { transferConfig, reference } = input;

  assertAzureTransferConfig(transferConfig);
  const { authentication, baseUrl } = transferConfig;

  return `${baseUrl}/${buildObjectKey(reference)}?${authentication}`;
}

export function buildBlobName(reference: ObjectReference): string {
  const { relativeDirectory, objectName } = reference;
  return (relativeDirectory ? `${relativeDirectory}/` : "") + objectName;
}

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

export function buildExpiresOn(expiresInSeconds: number): Date {
  const expiresOn = new Date();
  expiresOn.setSeconds(expiresOn.getSeconds() + expiresInSeconds);
  return expiresOn;
}
