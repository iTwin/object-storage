/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { STSClient } from "@aws-sdk/client-sts";

import {
  assertTransferConfig,
  TransferConfig,
} from "@itwin/object-storage-core/lib/common";

import {
  assertPrimitiveType,
  FalsyValueError,
} from "@itwin/cloud-agnostic-core";

import { S3TransferConfig } from "./Interfaces";

export function assertS3TransferConfig(
  transferConfig: TransferConfig | S3TransferConfig
): asserts transferConfig is S3TransferConfig {
  assertTransferConfig(transferConfig);
  if (!("authentication" in transferConfig))
    throw new FalsyValueError("transferConfig.authentication");

  assertPrimitiveType(
    transferConfig.authentication,
    "transferConfig.authentication",
    "object"
  );
  assertPrimitiveType(
    transferConfig.authentication.accessKey,
    "transferConfig.authentication.accessKey",
    "string"
  );
  assertPrimitiveType(
    transferConfig.authentication.secretKey,
    "transferConfig.authentication.secretKey",
    "string"
  );
  assertPrimitiveType(
    transferConfig.authentication.sessionToken,
    "transferConfig.authentication.sessionToken",
    "string"
  );

  if (!("region" in transferConfig))
    throw new FalsyValueError("transferConfig.region");
  assertPrimitiveType(transferConfig.region, "transferConfig.region", "string");

  if (!("bucket" in transferConfig))
    throw new FalsyValueError("transferConfig.bucket");
  assertPrimitiveType(transferConfig.bucket, "transferConfig.bucket", "string");
}

export function createStsClient(config: {
  stsBaseUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
}): STSClient {
  const { stsBaseUrl, region, accessKey, secretKey } = config;

  return new STSClient({
    apiVersion: "2011-06-15",
    endpoint: stsBaseUrl,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
}
