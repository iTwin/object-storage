/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import type { HttpHandlerOptions } from "@aws-sdk/types";

import {
  assertRelativeDirectory,
  instanceOfUrlTransferInput,
} from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  downloadFromUrl,
  streamToTransferType,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  ClientStorage,
  TransferData,
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

import { handleS3UrlUpload } from "./internal/Helpers";

export class S3ClientStorage extends ClientStorage {
  constructor(private _clientWrapperFactory: S3ClientWrapperFactory) {
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
    if (instanceOfUrlTransferInput(input)) return handleS3UrlUpload(input);

    let { data } = input;
    const { metadata } = input;

    if ("reference" in input)
      assertRelativeDirectory(input.reference.relativeDirectory);

    if (typeof data === "string") {
      await assertFileNotEmpty(data);
      data = createReadStream(data);
    }

    return createAndUseClient(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapper) =>
        clientWrapper.upload(input.reference, data, metadata)
    );
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
}
