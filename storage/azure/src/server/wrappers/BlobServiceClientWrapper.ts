/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import {
  BlobClient,
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
  ContainerItem,
  ServiceListContainersSegmentResponse,
} from "@azure/storage-blob";
import { injectable } from "inversify";

import { ObjectReference } from "@itwin/object-storage-core";

import { buildBlobName } from "../../common/internal";

@injectable()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  public listContainers(): PagedAsyncIterableIterator<
    ContainerItem,
    ServiceListContainersSegmentResponse
  > {
    return this._client.listContainers();
  }
}
