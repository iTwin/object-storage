/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  assertPrimitiveType,
  FalsyValueError,
} from "@itwin/cloud-agnostic-core/lib/internal";
import {
  ObjectReference,
  TransferConfig,
} from "@itwin/object-storage-core/lib/common";
import {
  assertTransferConfig,
  buildObjectKey,
} from "@itwin/object-storage-core/lib/common/internal";

import { AzureTransferConfig, AzureTransferConfigInput } from "../Interfaces";

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

export function getExpiryDate(options?: {
  expiresInSeconds?: number;
  expiresOn?: Date;
}): Date {
  if (options?.expiresInSeconds && options?.expiresOn) {
    throw new Error(
      "Only one of 'expiresInSeconds' and 'expiresOn' can be specified."
    );
  }
  if (options?.expiresInSeconds) {
    return new Date(Date.now() + options.expiresInSeconds * 1000);
  }
  if (options?.expiresOn) {
    return options.expiresOn;
  }
  return new Date(Date.now() + 60 * 60 * 1000); // expires in one hour by default
}