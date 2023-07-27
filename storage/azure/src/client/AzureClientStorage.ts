/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { promises } from "fs";
import { dirname } from "path";
import { Readable } from "stream";

import { BlobDownloadOptions } from "@azure/storage-blob";
import { inject, injectable } from "inversify";

import { assertRelativeDirectory } from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  isLocalTransferInput,
  streamToTransferType,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  ClientStorage,
  EntityPageListIterator,
  ObjectReference,
  TransferData,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import {
  AzureDirectoryTransferConfigInput,
  AzureTransferConfigInput,
} from "../common";
import { Types } from "../common";
import {
  AzureConfigDownloadInput,
  AzureConfigUploadInput,
  AzureUploadInMultiplePartsInput,
} from "../server";
import { BlockBlobClientWrapperFactory } from "../server/wrappers";
import { BlobClientWrapperFactory } from "../server/wrappers/BlobClientWrapper/BlobClientWrapperFactory";
import { ContainerClientWrapperFactory } from "../server/wrappers/ContainerClientWrapper/ContainerClientWrapperFactory";

@injectable()
export class AzureClientStorage extends ClientStorage {
  constructor(
    @inject(Types.Client.blobClientWrapperFactory)
    private _blobClientWrapperFactory: BlobClientWrapperFactory,
    @inject(Types.Client.blockBlobClientWrapperFactory)
    private _blockBlobClientWrapperFactory: BlockBlobClientWrapperFactory,
    @inject(Types.Client.containerClientWrapperFactory)
    private _containerClientWrapperFactory: ContainerClientWrapperFactory
  ) {
    super();
  }

  public download(
    input: (UrlDownloadInput | AzureConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;

  public download(
    input: (UrlDownloadInput | AzureConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;

  public download(
    input: (UrlDownloadInput | AzureConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;

  public async download(
    input: UrlDownloadInput | AzureConfigDownloadInput
  ): Promise<TransferData> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);

    if (isLocalTransferInput(input))
      await promises.mkdir(dirname(input.localPath), { recursive: true });

    const options: BlobDownloadOptions = {
      abortSignal: input.abortSignal,
    };

    const downloadStream = await this._blockBlobClientWrapperFactory
      .create(input)
      .download(options);

    return streamToTransferType(
      downloadStream,
      input.transferType,
      input.localPath
    );
  }

  public async upload(
    input: UrlUploadInput | AzureConfigUploadInput
  ): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    if (typeof input.data === "string") await assertFileNotEmpty(input.data);

    return this._blockBlobClientWrapperFactory
      .create(input)
      .upload(input.data, input.metadata);
  }

  public async uploadInMultipleParts(
    input: AzureUploadInMultiplePartsInput
  ): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    if (typeof input.data === "string") await assertFileNotEmpty(input.data);

    return this._blockBlobClientWrapperFactory
      .create(input)
      .uploadInMultipleParts(input.data, input.options);
  }

  public async deleteObject(input: AzureTransferConfigInput): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);

    const blobClient = this._blobClientWrapperFactory.create(input);
    await blobClient.delete();
  }

  public getListObjectsPagedIterator(
    input: AzureDirectoryTransferConfigInput,
    maxPageSize = 1000
  ): EntityPageListIterator<ObjectReference> {
    const containerClient = this._containerClientWrapperFactory.create(input);
    const pageIterator: EntityPageListIterator<ObjectReference> =
      new EntityPageListIterator(() =>
        containerClient.getObjectsNextPage(input, {
          maxPageSize: maxPageSize,
        })
      );
    return pageIterator;
  }
}
