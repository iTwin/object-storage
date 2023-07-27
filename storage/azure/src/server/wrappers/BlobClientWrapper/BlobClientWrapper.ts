/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobClient,
  BlobDeleteOptions,
  BlobDeleteResponse,
} from "@azure/storage-blob";

export class BlobClientWrapper {
  constructor(private readonly _client: BlobClient) {}

  public delete(options?: BlobDeleteOptions): Promise<BlobDeleteResponse> {
    return this._client.delete(options);
  }
}
