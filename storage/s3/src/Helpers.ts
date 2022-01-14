/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";

import {
  TemporaryS3Credentials,
  TransferConfig,
} from "@itwin/object-storage-core";

import { S3ClientWrapper } from "./S3ClientWrapper";

export function transferConfigToS3ClientWrapper(
  transferConfig: TransferConfig,
  bucket: string
): S3ClientWrapper {
  const { authentication, expiration, baseUrl } = transferConfig;
  const { accessKey, secretKey, sessionToken } =
    authentication as TemporaryS3Credentials;

  if (new Date() > expiration) throw Error("Transfer config is expired");

  return new S3ClientWrapper(
    createS3Client({ baseUrl, accessKey, secretKey, sessionToken }),
    bucket
  );
}

export function createS3Client(config: {
  baseUrl: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
}): S3Client {
  const { baseUrl, accessKey, secretKey, sessionToken } = config;

  return new S3Client({
    endpoint: baseUrl,
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
