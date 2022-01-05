/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { inject, injectable } from "inversify";

import {
  buildObjectKey,
  ObjectReference,
  PresignedUrlProvider,
} from "@itwin/object-storage-core";

import { Types } from "./Types";
@injectable()
export class S3PresignedUrlProvider implements PresignedUrlProvider {
  private readonly _client: S3Client;
  private readonly _bucket: string;

  public constructor(client: S3Client, @inject(Types.bucket) bucket: string) {
    this._client = client;
    this._bucket = bucket;
  }

  public async getDownloadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string> {
    /* eslint-disable @typescript-eslint/naming-convention */
    return getSignedUrl(
      this._client,
      new GetObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      }),
      {
        expiresIn: expiresInSeconds,
      }
    );
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  public async getUploadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string> {
    /* eslint-disable @typescript-eslint/naming-convention */
    return getSignedUrl(
      this._client,
      new PutObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      }),
      {
        expiresIn: expiresInSeconds,
      }
    );
    /* eslint-enable @typescript-eslint/naming-convention */
  }
}
