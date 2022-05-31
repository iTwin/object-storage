/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";

import {
  instanceOfTransferInput,
  metadataToHeaders,
  Types,
} from "@itwin/object-storage-core/lib/common";
import {
  downloadFromUrlFrontend,
  FrontendConfigUploadInput,
  FrontendStorage,
  FrontendTransferData,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
  streamToTransferTypeFrontend,
  uploadToUrlFrontend,
} from "@itwin/object-storage-core/lib/frontend";

import { FrontendS3ConfigDownloadInput } from "./FrontendInterfaces";
import { createAndUseClientFrontend } from "./Helpers";
import {
  S3ClientWrapperFactoryFrontend,
  S3ClientWrapperFrontend,
} from "./wrappers";

@injectable()
export class S3FrontendStorage extends FrontendStorage {
  public constructor(
    @inject(Types.Frontend.clientWrapperFactory)
    private _clientWrapperFactory: S3ClientWrapperFactoryFrontend
  ) {
    super();
  }

  public download(
    input: (FrontendUrlDownloadInput | FrontendS3ConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<ArrayBuffer>;

  public download(
    input: (FrontendUrlDownloadInput | FrontendS3ConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<ReadableStream>;

  public async download(
    input: FrontendUrlDownloadInput | FrontendS3ConfigDownloadInput
  ): Promise<FrontendTransferData> {
    if (instanceOfTransferInput(input)) return downloadFromUrlFrontend(input);

    return createAndUseClientFrontend(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapperFrontend) => {
        const downloadStream = await clientWrapper.download(input.reference);
        return streamToTransferTypeFrontend(downloadStream, input.transferType);
      }
    );
  }

  public async upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void> {
    const { data, metadata } = input;

    if (instanceOfTransferInput(input))
      return uploadToUrlFrontend(
        input.url,
        data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );

    return createAndUseClientFrontend(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapperFrontend) =>
        clientWrapper.upload(input.reference, data, metadata)
    );
  }

  public async uploadInMultipleParts(
    input: FrontendUploadInMultiplePartsInput
  ): Promise<void> {
    return createAndUseClientFrontend(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: S3ClientWrapperFrontend) =>
        clientWrapper.uploadInMultipleParts(
          input.reference,
          input.data,
          input.options
        )
    );
  }
}
