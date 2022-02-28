/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";

import {
  assertPrimitiveType,
  FalsyValueError,
} from "@itwin/cloud-agnostic-core";
import {
  assertTransferConfig,
  TransferConfig,
} from "@itwin/object-storage-core";

import { S3TransferConfig } from "./Interfaces";
import { S3ClientWrapper } from "./S3ClientWrapper";

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

export function transferConfigToS3ClientWrapper(
  transferConfig: TransferConfig,
  bucket: string
): S3ClientWrapper {
  assertS3TransferConfig(transferConfig);

  const { baseUrl, region, authentication } = transferConfig;
  const { accessKey, secretKey, sessionToken } = authentication;

  return new S3ClientWrapper(
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
