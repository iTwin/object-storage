/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { S3Client } from "@aws-sdk/client-s3";

import { metadataToHeaders } from "@itwin/object-storage-core/lib/common/internal";
import { FrontendUrlUploadInput } from "@itwin/object-storage-core/lib/frontend";
import { uploadToUrlFrontend } from "@itwin/object-storage-core/lib/frontend/internal";

export function createMinioS3ClientFrontend(config: {
  baseUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
}): S3Client {
  const { baseUrl, region, accessKey, secretKey, sessionToken } = config;

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
    forcePathStyle: true,
  });
}

export async function handleMinioUrlUploadFrontend(
  input: FrontendUrlUploadInput
): Promise<void> {
  const { data, metadata, url } = input;
  const headers = metadata
    ? metadataToHeaders(metadata, "x-amz-meta-")
    : undefined;
  return uploadToUrlFrontend(url, data, headers);
}
