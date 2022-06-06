/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";

import {
  assertRelativeDirectory,
  downloadFromUrlFrontend,
  FrontendConfigUploadInput,
  FrontendStorage,
  FrontendTransferData,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
  instanceOfUrlTransferInput,
  metadataToHeaders,
  streamToTransferTypeFrontend,
  Types,
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
    if (instanceOfUrlTransferInput(input))
      return downloadFromUrlFrontend(input);
    else assertRelativeDirectory(input.reference.relativeDirectory);

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

    if (instanceOfUrlTransferInput(input))
      return uploadToUrlFrontend(
        input.url,
        data,
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );
    else {
      assertRelativeDirectory(input.reference.relativeDirectory);
      return createAndUseClientFrontend(
        () => this._clientWrapperFactory.create(input.transferConfig),
        async (clientWrapper: S3ClientWrapperFrontend) =>
          clientWrapper.upload(input.reference, data, metadata)
      );
    }
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
