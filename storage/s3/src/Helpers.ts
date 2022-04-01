/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";

import {
  assertTransferConfig,
  TransferConfig,
} from "@itwin/object-storage-core/lib/frontend";

import {
  assertPrimitiveType,
  FalsyValueError,
} from "@itwin/cloud-agnostic-core";

import { S3TransferConfig } from "./Interfaces";
import { FrontendS3ClientWrapper } from "./S3ClientWrapper";

function assertS3TransferConfig(
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
}

export function transferConfigToFrontendS3ClientWrapper(
  transferConfig: TransferConfig,
  bucket: string
): FrontendS3ClientWrapper {
  return transferConfigToS3Wrapper(
    transferConfig,
    bucket,
    FrontendS3ClientWrapper
  );
}

export function transferConfigToS3Wrapper<T>(
  transferConfig: TransferConfig,
  bucket: string,
  clientConstructor: new (client: S3Client, bucket: string) => T
): T {
  assertS3TransferConfig(transferConfig);

  const { baseUrl, region, authentication } = transferConfig;
  const { accessKey, secretKey, sessionToken } = authentication;

  return new clientConstructor(
    createS3Client({ baseUrl, region, accessKey, secretKey, sessionToken }),
    bucket
  );
}

export function createS3Client(config: {
  baseUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
}): S3Client {
  const { baseUrl, region, accessKey, secretKey, sessionToken } = config;

  return new S3Client({
    endpoint: baseUrl,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      sessionToken,
    },
    forcePathStyle: true, // needed for minio
  });
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
