/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";
import { Client } from "minio";

import {
  buildObjectKey,
  ExpiryOptions,
} from "@itwin/object-storage-core/lib/common/internal";
import { getExpiresInSeconds } from "@itwin/object-storage-s3/lib/server/internal";

import {
  ObjectReference,
  PresignedUrlProvider,
} from "@itwin/object-storage-core";
import { Types } from "@itwin/object-storage-s3";

@injectable()
export class MinioPresignedUrlProvider implements PresignedUrlProvider {
  private readonly _client: Client;
  private readonly _bucket: string;

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  public constructor(client: Client, @inject(Types.bucket) bucket: string) {
    this._client = client;
    this._bucket = bucket;
  }

  public async getDownloadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    return this._client.presignedGetObject(
      this._bucket,
      buildObjectKey(reference),
      getExpiresInSeconds(expiry)
    );
  }

  public async getUploadUrl(
    reference: ObjectReference,
    expiry?: ExpiryOptions
  ): Promise<string> {
    return this._client.presignedPutObject(
      this._bucket,
      buildObjectKey(reference),
      getExpiresInSeconds(expiry)
    );
  }
}
