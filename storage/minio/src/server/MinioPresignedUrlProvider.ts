/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";
import { Client } from "minio";

import {
  buildObjectKey,
  ObjectReference,
} from "@itwin/object-storage-core/lib/common";
import { PresignedUrlProvider } from "@itwin/object-storage-core/lib/server";

import { Types } from "@itwin/object-storage-s3";

@injectable()
export class MinioPresignedUrlProvider implements PresignedUrlProvider {
  private readonly _client: Client;
  private readonly _bucket: string;

  public constructor(client: Client, @inject(Types.bucket) bucket: string) {
    this._client = client;
    this._bucket = bucket;
  }

  public async getDownloadUrl(
    reference: ObjectReference,
    expiresInSeconds = 3600
  ): Promise<string> {
    return this._client.presignedGetObject(
      this._bucket,
      buildObjectKey(reference),
      expiresInSeconds
    );
  }

  public async getUploadUrl(
    reference: ObjectReference,
    expiresInSeconds = 3600
  ): Promise<string> {
    return this._client.presignedPutObject(
      this._bucket,
      buildObjectKey(reference),
      expiresInSeconds
    );
  }
}
