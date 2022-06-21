/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";

export function createMinioS3ClientFrontend(config: {
  baseUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
}): S3Client {
  const { baseUrl, region, accessKey, secretKey, sessionToken } = config;

  // https://github.com/aws/aws-sdk-js-v3/issues/3660
  const endpointUrl = new URL(baseUrl);
  const endpoint = {
    protocol: endpointUrl.protocol.slice(0, -1), // "http:" -> "http"
    hostname: `${endpointUrl.hostname}:${endpointUrl.port}`,
    path: endpointUrl.pathname,
  };

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      sessionToken,
    },
    forcePathStyle: true,
  });
}
