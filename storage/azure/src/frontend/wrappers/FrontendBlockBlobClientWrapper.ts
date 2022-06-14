/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient, Metadata } from "@azure/storage-blob";

import {
  FrontendMultipartUploadData,
  MultipartUploadOptions,
  streamToBufferFrontend,
} from "@itwin/object-storage-core/lib/frontend";

export class FrontendBlockBlobClientWrapper {
  constructor(private readonly _client: BlockBlobClient) {}

  public async download(): Promise<Blob> {
    // TODO: update behavior as per documentation
    const downloadResponse = await this._client.download();
    return downloadResponse.blobBody!;
  }

  public async upload(data: ArrayBuffer, metadata?: Metadata): Promise<void> {
    // TODO: update behavior as per documentation
    await this._client.upload(data, data.byteLength, { metadata });
  }

  public async uploadInMultipleParts(
    data: FrontendMultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    const { metadata, partSize, queueSize } = options ?? {};
    const dataBuffer = await streamToBufferFrontend(data);
    await this._client.uploadBrowserData(dataBuffer, {
      metadata,
      blockSize: partSize,
      concurrency: queueSize,
    });
  }
}
