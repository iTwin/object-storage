/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import {
  assertObjectReference,
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
import { streamToTransferTypeFrontend } from "@itwin/object-storage-core/lib/frontend/internal";
import { FrontendUrlTransferClient } from "@itwin/object-storage-core/lib/frontend/internal";

import { assertGoogleTransferConfig } from "../common/Helpers";

import {
  FrontendGoogleConfigDownloadInput,
  FrontendGoogleConfigUploadInput,
  FrontendGoogleUploadInMultiplePartsInput,
} from "./FrontendInterfaces";

export class GoogleFrontendStorage extends FrontendStorage {
  public constructor(
    private _urlTransferClient: FrontendUrlTransferClient = new FrontendUrlTransferClient()
  ) {
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
      return this._urlTransferClient.download(input);

    assertObjectReference(input.reference);
    assertGoogleTransferConfig(input.transferConfig);

    const updatedInput: FrontendUrlDownloadInput = {
      url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(
        input.transferConfig.bucketName
      )}/o/${encodeURIComponent(this.objectName(input.reference))}?alt=media`,
      transferType: input.transferType,
      storageType: input.transferConfig.storageType,
    };

    return this._urlTransferClient.download(updatedInput, {
      Authorization: input.transferConfig.authentication,
    });
  }

  private objectName(reference: ObjectReference): string {
    return buildObjectKey(reference);
  }

  private uploadUrl(bucketName: string, reference: ObjectReference): string {
    return `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(
      bucketName
    )}/o?uploadType=media&name=${encodeURIComponent(
      this.objectName(reference)
    )}`;
  }

  public async upload(
    input: FrontendUrlUploadInput | FrontendGoogleConfigUploadInput
  ): Promise<void> {
    const { data } = input;

    if (instanceOfUrlTransferInput(input))
      return this._urlTransferClient.upload(input.url, data, "PUT");

    assertObjectReference(input.reference);
    assertGoogleTransferConfig(input.transferConfig);
    const url = this.uploadUrl(
      input.transferConfig.bucketName,
      input.reference
    );
    return this._urlTransferClient.upload(url, input.data, "POST", {
      Authorization: input.transferConfig.authentication,
      "Content-Type": "application/octet-stream",
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async uploadInMultipleParts(
    input: FrontendGoogleUploadInMultiplePartsInput
  ): Promise<void> {
    assertObjectReference(input.reference);
    assertGoogleTransferConfig(input.transferConfig);

    const url = this.uploadUrl(
      input.transferConfig.bucketName,
      input.reference
    );
    const data = await streamToTransferTypeFrontend(input.data, "buffer");

    return this._urlTransferClient.upload(url, data, "POST", {
      Authorization: input.transferConfig.authentication,
      "Content-Type": "application/octet-stream",
    });
  }
}
