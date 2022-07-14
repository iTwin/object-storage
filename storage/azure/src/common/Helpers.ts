/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ObjectReference,
  TransferConfig,
} from "@itwin/object-storage-core/lib/common";
import {
  assertTransferConfig,
  buildObjectKey,
} from "@itwin/object-storage-core/lib/common/internal";

import {
  assertPrimitiveType,
  FalsyValueError,
} from "@itwin/cloud-agnostic-core/lib/internal";

import { AzureTransferConfig, AzureTransferConfigInput } from "./Interfaces";

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

export function buildBlobUrl(input: AzureTransferConfigInput): string {
  assertAzureTransferConfig(input.transferConfig);
  const { authentication, baseUrl } = input.transferConfig;
  return `${baseUrl}/${buildObjectKey(input.reference)}?${authentication}`;
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
