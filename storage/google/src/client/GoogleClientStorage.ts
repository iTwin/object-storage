/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Readable } from "stream";

import {
  assertRelativeDirectory,
  instanceOfUrlTransferInput,
} from "@itwin/object-storage-core/lib/common/internal";
import {
  assertFileNotEmpty,
  assertLocalFile,
  bufferToTransferType,
  downloadFromUrl,
  uploadToUrl,
} from "@itwin/object-storage-core/lib/server/internal";

import {
  ClientStorage,
  TransferData,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import {
  GoogleConfigDownloadInput,
  GoogleConfigUploadInput,
  GoogleUploadInMultiplePartsInput,
} from "../server";

import { ClientStorageWrapperFactory } from "./wrappers";

export class GoogleClientStorage extends ClientStorage {
  public constructor(private _storageFactory: ClientStorageWrapperFactory) {
    super();
  }

  public download(
    input: (UrlDownloadInput | GoogleConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<Buffer>;

  public download(
    input: (UrlDownloadInput | GoogleConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<Readable>;

  public download(
    input: (UrlDownloadInput | GoogleConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;

  public override async download(
    input: UrlDownloadInput | GoogleConfigDownloadInput
  ): Promise<TransferData> {
    if (instanceOfUrlTransferInput(input)) return await downloadFromUrl(input);
    assertRelativeDirectory(input.reference.relativeDirectory);
    if (input.transferType === "local") {
      assertLocalFile(input.localPath);
    }

    const storage = this._storageFactory.createFromToken(input.transferConfig);
    const downloadBuffer = await storage.downloadFile(
      input.reference,
      input.localPath
    );

    if (input.transferType === "local") return input.localPath!;
    return bufferToTransferType(downloadBuffer, input.transferType);
  }

  public override async upload(
    input: UrlUploadInput | GoogleConfigUploadInput
  ): Promise<void> {
    const isUrlTransfer = instanceOfUrlTransferInput(input);
    if (!isUrlTransfer)
      assertRelativeDirectory(input.reference.relativeDirectory);
    if (typeof input.data === "string") await assertFileNotEmpty(input.data);

    if (isUrlTransfer)
      return uploadToUrl(input.url, input.data, input.metadata);

    const storage = this._storageFactory.createFromToken(input.transferConfig);
    await storage.uploadFile(input.reference, input.data, input.metadata);
  }

  public override async uploadInMultipleParts(
    input: GoogleUploadInMultiplePartsInput
  ): Promise<void> {
    assertRelativeDirectory(input.reference.relativeDirectory);
    if (typeof input.data === "string") await assertFileNotEmpty(input.data);

    const storage = this._storageFactory.createFromToken(input.transferConfig);
    await storage.uploadFile(
      input.reference,
      input.data,
      input.options?.metadata,
      undefined,
      input.options?.partSize
    );
  }
}
