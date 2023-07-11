/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobClient,
  BlobItem,
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
  ContainerItem,
} from "@azure/storage-blob";
import { injectable } from "inversify";

import {
  buildObjectKey,
  buildObjectReference,
} from "@itwin/object-storage-core/lib/common/internal";

import {
  BaseDirectory,
  ObjectReference,
  EntityCollectionPage,
} from "@itwin/object-storage-core";

import { buildBlobName } from "../../common/internal";

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

  public async getDirectoriesNextPage(options: {
    maxPageSize: number;
    continuationToken?: string;
  }): Promise<EntityCollectionPage<BaseDirectory>> {
    const iterator = this._client.listContainers().byPage({
      maxPageSize: options.maxPageSize,
      continuationToken: options.continuationToken,
    });

    const response = (await iterator.next()).value;
    const directories = response.containerItems.map(
      (directory: ContainerItem) =>
        ({ baseDirectory: directory.name } as BaseDirectory)
    );
    const ret: EntityCollectionPage<BaseDirectory> = {
      entities: directories,
      next:
        response.continuationToken == ""
          ? undefined
          : () =>
              this.getDirectoriesNextPage({
                maxPageSize: options.maxPageSize,
                continuationToken: response.continuationToken,
              }),
    };
    return ret;
  }

  public async getObjectsNextPage(
    directory: BaseDirectory,
    options: {
      maxPageSize: number;
      continuationToken?: string;
    }
  ): Promise<EntityCollectionPage<ObjectReference>> {
    const containerClient = this._client.getContainerClient(
      directory.baseDirectory
    );
    const iterator = containerClient.listBlobsFlat().byPage({
      maxPageSize: options.maxPageSize,
      continuationToken: options.continuationToken,
    });

    const response = (await iterator.next()).value;
    const objects = response.segment.blobItems.map((item: BlobItem) =>
      buildObjectReference(
        buildObjectKey({
          ...directory,
          objectName: item.name,
        })
      )
    );

    const ret: EntityCollectionPage<ObjectReference> = {
      entities: objects,
      next:
        response.continuationToken == ""
          ? undefined
          : () =>
              this.getObjectsNextPage(directory, {
                maxPageSize: options.maxPageSize,
                continuationToken: response.continuationToken,
              }),
    };
    return ret;
  }
}
