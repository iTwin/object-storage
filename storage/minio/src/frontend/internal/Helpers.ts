/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";

import { RetryOptions } from "@itwin/object-storage-core/lib/common";
import { metadataToHeaders } from "@itwin/object-storage-core/lib/common/internal";
import { FrontendUrlUploadInput } from "@itwin/object-storage-core/lib/frontend";
import { FrontendUrlTransferClient } from "@itwin/object-storage-core/lib/frontend/internal";

export function createMinioS3ClientFrontend(config: {
  baseUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
  retryOptions?: RetryOptions;
}): S3Client {
  const { baseUrl, region, accessKey, secretKey, sessionToken, retryOptions } =
    config;

  const endpointUrl = new URL(baseUrl);
  const endpoint = {
    url: endpointUrl,
  };

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      sessionToken,
    },
    ...(retryOptions?.maxRetries !== undefined && {
      maxAttempts: retryOptions.maxRetries + 1,
    }),
    forcePathStyle: true,
  });
}

export async function handleMinioUrlUploadFrontend(
  input: FrontendUrlUploadInput,
  urlTransferClient: FrontendUrlTransferClient = new FrontendUrlTransferClient()
): Promise<void> {
  const { data, metadata, url } = input;
  const headers = metadata
    ? metadataToHeaders(metadata, "x-amz-meta-")
    : undefined;
  return urlTransferClient.upload(url, data, "PUT", headers);
}
