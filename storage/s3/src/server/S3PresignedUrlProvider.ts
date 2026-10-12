/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { BuildMiddleware, HttpRequest } from "@aws-sdk/types";

import { buildObjectKey } from "@itwin/object-storage-core/lib/common/internal";

import {
  ExpiryOptions,
  ObjectReference,
  PresignedUrlProvider,
} from "@itwin/object-storage-core";

import { getExpiresInSeconds } from "./internal";
import { S3ServerStorageConfig } from "./S3ServerStorage";

// The SDK checksums the still-empty body, which would reject the uploaded content.
const removeRequestChecksums: BuildMiddleware<
  PutObjectCommandInput,
  PutObjectCommandOutput
> = (next) => async (args) => {
  const { headers } = args.request as HttpRequest;
  for (const name of Object.keys(headers)) {
    const lowerCaseName = name.toLowerCase();
    if (
      lowerCaseName.startsWith("x-amz-checksum-") ||
      lowerCaseName === "x-amz-sdk-checksum-algorithm"
    )
      delete headers[name];
  }
  return next(args);
};

export class S3PresignedUrlProvider implements PresignedUrlProvider {
  private readonly _client: S3Client;
  private readonly _bucket: string;

  public constructor(client: S3Client, config: S3ServerStorageConfig) {
    this._client = client;
    this._bucket = config.bucket;
  }

  public async getDownloadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    /* eslint-disable @typescript-eslint/naming-convention */
    return getSignedUrl(
      this._client,
      new GetObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      }),
      {
        expiresIn: getExpiresInSeconds(expiry),
      }
    );
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  public async getUploadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const command = new PutObjectCommand({
      Bucket: this._bucket,
      Key: buildObjectKey(reference),
    });
    /* eslint-enable @typescript-eslint/naming-convention */
    command.middlewareStack.addRelativeTo(removeRequestChecksums, {
      name: "removeRequestChecksumsMiddleware",
      relation: "after",
      toMiddleware: "flexibleChecksumsMiddleware",
    });
    return getSignedUrl(this._client, command, {
      expiresIn: getExpiresInSeconds(expiry),
    });
  }
}
