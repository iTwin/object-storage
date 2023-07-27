/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  BlobItem,
  ContainerClient,
  ContainerListBlobsOptions,
} from "@azure/storage-blob";

import {
  buildObjectKey,
  buildObjectReference,
} from "@itwin/object-storage-core/lib/common/internal";

import {
  EntityCollectionPage,
  ObjectReference,
} from "@itwin/object-storage-core";

import { AzureDirectoryTransferConfigInput } from "../../../common";

export class ContainerClientWrapper {
  constructor(private readonly _client: ContainerClient) {}

  public async listObjects(
    input: AzureDirectoryTransferConfigInput,
    options?: ContainerListBlobsOptions
  ): Promise<ObjectReference[]> {
    const iterator = this._client.listBlobsFlat(options);
    const names = Array<string>();
    for await (const item of iterator) names.push(item.name);

    return names.map((name) =>
      buildObjectReference(
        buildObjectKey({
          baseDirectory: input.baseDirectory.baseDirectory,
          objectName: name,
        })
      )
    );
  }

  public async getObjectsNextPage(
    input: AzureDirectoryTransferConfigInput,
    options: {
      maxPageSize: number;
      continuationToken?: string;
    }
  ): Promise<EntityCollectionPage<ObjectReference>> {
    const iterator = this._client.listBlobsFlat().byPage({
      maxPageSize: options.maxPageSize,
      continuationToken: options.continuationToken,
    });

    const response = (await iterator.next()).value;
    const directory: string = input.baseDirectory.baseDirectory;
    const objects = response.segment.blobItems.map((item: BlobItem) =>
      buildObjectReference(
        buildObjectKey({
          baseDirectory: directory,
          objectName: item.name,
        })
      )
    );

    const page: EntityCollectionPage<ObjectReference> = {
      entities: objects,
      next:
        response.continuationToken == ""
          ? undefined
          : () =>
              this.getObjectsNextPage(input, {
                maxPageSize: options.maxPageSize,
                continuationToken: response.continuationToken,
              }),
    };
    return page;
  }
}
