/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { inject, injectable } from "inversify";

import {
  assertRelativeDirectory,
  instanceOfUrlTransferInput,
  metadataToHeaders,
} from "@itwin/object-storage-core/lib/common/internal";
import {
  FrontendConfigUploadInput,
  FrontendStorage,
  FrontendTransferData,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
  Types,
} from "@itwin/object-storage-core/lib/frontend";
import {
  downloadFromUrlFrontend,
  streamToTransferTypeFrontend,
  uploadToUrlFrontend,
} from "@itwin/object-storage-core/lib/frontend/internal";

import { FrontendS3ConfigDownloadInput } from "./FrontendInterfaces";
import { createAndUseClientFrontend } from "./internal";
import {
  FrontendS3ClientWrapper,
  FrontendS3ClientWrapperFactory,
} from "./wrappers";

@injectable()
export class S3FrontendStorage extends FrontendStorage {
  public constructor(
    @inject(Types.Frontend.clientWrapperFactory)
    private _clientWrapperFactory: FrontendS3ClientWrapperFactory
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
      async (clientWrapper: FrontendS3ClientWrapper) => {
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
        "PUT",
        metadata ? metadataToHeaders(metadata, "x-amz-meta-") : undefined
      );
    else {
      assertRelativeDirectory(input.reference.relativeDirectory);
      return createAndUseClientFrontend(
        () => this._clientWrapperFactory.create(input.transferConfig),
        async (clientWrapper: FrontendS3ClientWrapper) =>
          clientWrapper.upload(input.reference, data, metadata)
      );
    }
  }

  public async uploadInMultipleParts(
    input: FrontendUploadInMultiplePartsInput
  ): Promise<void> {
    assertRelativeDirectory(input.reference.relativeDirectory);

    return createAndUseClientFrontend(
      () => this._clientWrapperFactory.create(input.transferConfig),
      async (clientWrapper: FrontendS3ClientWrapper) =>
        clientWrapper.uploadInMultipleParts(
          input.reference,
          input.data,
          input.options
        )
    );
  }
}
