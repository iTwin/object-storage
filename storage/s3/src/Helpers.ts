/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient } from "@aws-sdk/client-sts";

import {
  Metadata,
  TemporaryS3Credentials,
  TransferConfig,
} from "@itwin/object-storage-core";

import { S3ClientWrapper } from "./S3ClientWrapper";

export function transferConfigToS3ClientWrapper(
  transferConfig: TransferConfig,
  bucket: string
): S3ClientWrapper {
  const { authentication, expiration, hostname, protocol } = transferConfig;
  const { accessKey, secretKey, sessionToken } =
    authentication as TemporaryS3Credentials;

  if (new Date() > expiration) throw Error("Transfer config is expired");

  return new S3ClientWrapper(
    createS3Client({ protocol, hostname, accessKey, secretKey, sessionToken }),
    bucket
  );
}

export function createS3Client(config: {
  protocol: string;
  hostname: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
}): S3Client {
  const { protocol, hostname, accessKey, secretKey, sessionToken } = config;

  return new S3Client({
    endpoint: `${protocol}://${hostname}`,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      sessionToken,
    },
    forcePathStyle: true, // needed for minio
  });
}

export function createStsClient(config: {
  protocol: string;
  stsHostname: string;
  accessKey: string;
  secretKey: string;
}): STSClient {
  const { protocol, stsHostname, accessKey, secretKey } = config;

  return new STSClient({
    apiVersion: "2011-06-15",
    endpoint: `${protocol}://${stsHostname}`,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
}

export function metadataToHeaders(metadata: Metadata): Record<string, string> {
  return Object.keys(metadata).reduce(
    (acc: Record<string, string>, suffix: string) => ({
      ...acc,
      [`x-amz-meta-${suffix}`.toLowerCase()]: metadata[suffix],
    }),
    {}
  );
}
