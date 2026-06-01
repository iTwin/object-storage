/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";

import { RetryOptions } from "@itwin/object-storage-core/lib/common";

export function createOssS3ClientFrontend(config: {
  baseUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
  retryOptions?: RetryOptions;
}): S3Client {
  const { baseUrl, region, accessKey, secretKey, sessionToken, retryOptions } =
    config;

  return new S3Client({
    endpoint: baseUrl,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      sessionToken,
    },
    ...(retryOptions?.maxRetries !== undefined && {
      maxAttempts: retryOptions.maxRetries + 1,
    }),
  });
}
