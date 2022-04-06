/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  assertTransferConfig,
  buildObjectKey,
  ConfigDownloadInput,
  ConfigUploadInput,
  ObjectReference,
  TransferConfig,
} from "@itwin/object-storage-core/lib/frontend";

import {
  assertPrimitiveType,
  FalsyValueError,
} from "@itwin/cloud-agnostic-core";

import { AzureTransferConfig } from ".";

export function assertAzureTransferConfig(
  transferConfig: TransferConfig | AzureTransferConfig
): asserts transferConfig is AzureTransferConfig {
  assertTransferConfig(transferConfig);

  if (!("authentication" in transferConfig))
    throw new FalsyValueError("transferConfig.authentication");
  assertPrimitiveType(
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

export function buildExpiresOn(expiresInSeconds: number): Date {
  const expiresOn = new Date();
  expiresOn.setSeconds(expiresOn.getSeconds() + expiresInSeconds);
  return expiresOn;
}
