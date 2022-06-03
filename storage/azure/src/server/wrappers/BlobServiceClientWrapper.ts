/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobClient,
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from "@azure/storage-blob";
import { injectable } from "inversify";

import { ObjectReference } from "@itwin/object-storage-core";

import { buildBlobName } from "../../common";

@injectable()
export class BlobServiceClientWrapper {
  private readonly _client: BlobServiceClient;

  constructor(client: BlobServiceClient) {
    this._client = client;
  }

  public getContainerClient(containerName: string): ContainerClient {
    return this._client.getContainerClient(containerName);
  }

  public getBlobClient(reference: ObjectReference): BlobClient {
    return this._client
      .getContainerClient(reference.baseDirectory)
      .getBlobClient(buildBlobName(reference));
  }

  public getBlockBlobClient(reference: ObjectReference): BlockBlobClient {
    return this._client
      .getContainerClient(reference.baseDirectory)
      .getBlockBlobClient(buildBlobName(reference));
  }
}
