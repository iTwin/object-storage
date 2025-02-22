/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { buildObjectKey } from "@itwin/object-storage-core/lib/common/internal";

import {
  ExpiryOptions,
  ObjectReference,
  PresignedUrlProvider,
} from "@itwin/object-storage-core";

import { getExpiresInSeconds } from "./internal";

export class S3PresignedUrlProvider implements PresignedUrlProvider {
  private readonly _client: S3Client;
  private readonly _bucket: string;

  public constructor(client: S3Client, bucket: string) {
    this._client = client;
    this._bucket = bucket;
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
    return getSignedUrl(
      this._client,
      new PutObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      }),
      {
        expiresIn: getExpiresInSeconds(expiry),
      }
    );
    /* eslint-enable @typescript-eslint/naming-convention */
  }
}
