/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import type { HttpHandlerOptions } from "@aws-sdk/types";
import { inject, injectable } from "inversify";

import {
  assertRelativeDirectory,
  instanceOfUrlTransferInput,
  metadataToHeaders,
} from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  downloadFromUrl,
  streamToTransferType,
  uploadToUrl,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  ClientStorage,
  ConfigTransferInput,
  DirectoryTransferConfigInput,
  EntityPageListIterator,
  ObjectReference,
  TransferData,
  Types,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import {
  S3ClientWrapper,
  S3ClientWrapperFactory,
  S3ConfigDownloadInput,
  S3ConfigUploadInput,
  S3UploadInMultiplePartsInput,
} from "../server";
import { createAndUseClient } from "../server/internal";

@injectable()
export class S3ClientStorage extends ClientStorage {
  constructor(
    @inject(Types.Client.clientWrapperFactory)
    private _clientWrapperFactory: S3ClientWrapperFactory
  ) {
    super();
  }

  public override download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;
  public override download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;
  public override download(
    input: (UrlDownloadInput | S3ConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;
  public override async download(
    input: UrlDownloadInput | S3ConfigDownloadInput
  ): Promise<TransferData> {
    if (instanceOfUrlTransferInput(input)) return downloadFromUrl(input);
    else assertRelativeDirectory(input.reference.relativeDirectory);

    const options: HttpHandlerOptions = {
      abortSignal: input.abortSignal,
    };

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) => {
        const downloadStream = await clientWrapper.download(
          input.reference,
          options
        );
        return streamToTransferType(
          downloadStream,
          input.transferType,
          input.localPath
        );
      }
    );
  }

  public override async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    let { data } = input;
    const { metadata } = input;

    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);

    if (typeof data === "string") {
      await assertFileNotEmpty(data);
      data = createReadStream(data);
    }

    if (instanceOfUrlTransferInput(input))
      return uploadToUrl(
        input.url,
        data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );
    else {
      return createAndUseClient(
        () => this._clientWrapperFactory.create(input.transferConfig),
        async (clientWrapper: S3ClientWrapper) =>
          clientWrapper.upload(input.reference, data, metadata)
      );
    }
  }

  public async uploadInMultipleParts(
    input: S3UploadInMultiplePartsInput
  ): Promise<void> {
    let { data } = input;
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);
    if (typeof data === "string") {
      await assertFileNotEmpty(data);
      data = createReadStream(data);
    }

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.uploadInMultipleParts(
          input.reference,
          data,
          input.options
        )
    );
  }

  public async deleteObject(input: ConfigTransferInput): Promise<void> {
    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) => {
        await clientWrapper.deleteObject(input.reference);
      }
    );
  }

  public getListObjectsPagedIterator(
    input: DirectoryTransferConfigInput,
    maxPageSize = 1000
  ): EntityPageListIterator<ObjectReference> {
    const options = {
      maxPageSize: maxPageSize,
    };

    const pageQueryFunc = createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) => {
        return await clientWrapper.getObjectsNextPage(
          input.baseDirectory,
          options
        );
      }
    );

    const pageIterator: EntityPageListIterator<ObjectReference> =
      new EntityPageListIterator(() => pageQueryFunc);

    return pageIterator;
  }
}
