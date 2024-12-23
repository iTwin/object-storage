/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  assertRelativeDirectory,
  buildObjectKey,
  instanceOfUrlTransferInput,
} from "@itwin/object-storage-core/lib/common/internal";
import {
  FrontendStorage,
  FrontendTransferData,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
  ObjectReference,
} from "@itwin/object-storage-core/lib/frontend";
import {
  downloadFromUrlFrontend,
  uploadToUrlFrontend,
  streamToTransferTypeFrontend,
} from "@itwin/object-storage-core/lib/frontend/internal";

import {
  FrontendGoogleConfigDownloadInput,
  FrontendGoogleConfigUploadInput,
  FrontendGoogleUploadInMultiplePartsInput,
} from "./FrontendInterfaces";

export class GoogleFrontendStorage extends FrontendStorage {
  public constructor() {
    super();
  }

  public download(
    input: (FrontendUrlDownloadInput | FrontendGoogleConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<ArrayBuffer>;

  public download(
    input: (FrontendUrlDownloadInput | FrontendGoogleConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<ReadableStream>;

  public async download(
    input: FrontendUrlDownloadInput | FrontendGoogleConfigDownloadInput
  ): Promise<FrontendTransferData> {
    if (instanceOfUrlTransferInput(input))
      return downloadFromUrlFrontend(input);

    assertRelativeDirectory(input.reference.relativeDirectory);

    const updatedInput: FrontendUrlDownloadInput = {
      url: `https://storage.googleapis.com/storage/v1/b/${
        input.transferConfig.bucketName
      }/o/${encodeURIComponent(this.objectName(input.reference))}?alt=media`,
      transferType: input.transferType,
    };

    return downloadFromUrlFrontend(updatedInput, {
      Authorization: input.transferConfig.authentication,
    });
  }

  private objectName(reference: ObjectReference): string {
    return buildObjectKey(reference);
  }

  public async upload(
    input: FrontendUrlUploadInput | FrontendGoogleConfigUploadInput
  ): Promise<void> {
    const { data } = input;

    if (instanceOfUrlTransferInput(input))
      return uploadToUrlFrontend(input.url, data, "PUT");

    assertRelativeDirectory(input.reference.relativeDirectory);
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${
      input.transferConfig.bucketName
    }/o?uploadType=media&name=${this.objectName(input.reference)}`;
    return uploadToUrlFrontend(url, input.data, "POST", {
      Authorization: input.transferConfig.authentication,
      "Content-Type": "application/octet-stream",
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async uploadInMultipleParts(
    input: FrontendGoogleUploadInMultiplePartsInput
  ): Promise<void> {
    assertRelativeDirectory(input.reference.relativeDirectory);

    const url = `https://storage.googleapis.com/upload/storage/v1/b/${
      input.transferConfig.bucketName
    }/o?uploadType=media&name=${this.objectName(input.reference)}`;
    const data = await streamToTransferTypeFrontend(input.data, "buffer");

    return uploadToUrlFrontend(url, data, "POST", {
      Authorization: input.transferConfig.authentication,
      "Content-Type": "application/octet-stream",
    });
  }
}
