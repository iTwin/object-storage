/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";

import { assertValueIsTruthyAndOfType } from "@itwin/cloud-agnostic-core";
import { TransferConfig } from "@itwin/object-storage-core";

import { S3TransferConfig } from "./Interfaces";
import { S3ClientWrapper } from "./S3ClientWrapper";

function assertS3TransferConfig(
  transferConfig: TransferConfig
): asserts transferConfig is S3TransferConfig {
  assertValueIsTruthyAndOfType(transferConfig, "transferConfig", "object");
  assertValueIsTruthyAndOfType(
    (transferConfig as S3TransferConfig).authentication,
    "transferConfig.authentication",
    "object"
  );
  assertValueIsTruthyAndOfType(
    (transferConfig as S3TransferConfig).authentication.accessKey,
    "transferConfig.authentication.accessKey",
    "string"
  );
  assertValueIsTruthyAndOfType(
    (transferConfig as S3TransferConfig).authentication.secretKey,
    "transferConfig.authentication.secretKey",
    "string"
  );
  assertValueIsTruthyAndOfType(
    (transferConfig as S3TransferConfig).authentication.sessionToken,
    "transferConfig.authentication.sessionToken",
    "string"
  );
  assertValueIsTruthyAndOfType(
    (transferConfig as S3TransferConfig).region,
    "transferConfig.region",
    "string"
  );
}

export function transferConfigToS3ClientWrapper(
  transferConfig: TransferConfig,
  bucket: string
): S3ClientWrapper {
  assertS3TransferConfig(transferConfig);

  const { baseUrl, region, authentication, expiration } = transferConfig;
  const { accessKey, secretKey, sessionToken } = authentication;

  if (new Date() > expiration) throw Error("Transfer config is expired");

  if (!region) throw new Error("Region must be defined for S3 storage.");

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
  accessKey: string;
  secretKey: string;
}): STSClient {
  const { stsBaseUrl, accessKey, secretKey } = config;

  return new STSClient({
    apiVersion: "2011-06-15",
    endpoint: stsBaseUrl,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
}
