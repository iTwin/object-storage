/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import {
  BlobClient,
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from "@azure/storage-blob";
import { injectable } from "inversify";

import { ObjectReference } from "@itwin/object-storage-core";

import { buildBlobName } from "./Helpers";

@injectable()
export class BlobServiceClientWrapper {
  private readonly _client: BlobServiceClient;

  constructor(client: BlobServiceClient) {
    this._client = client;
  }

  public async createContainerIfNotExists(name: string): Promise<void> {
    await this.getContainerClient(name).createIfNotExists();
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
