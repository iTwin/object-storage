/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import {
  downloadFromUrl,
  instanceOfUrlDownloadInput,
  TransferConfig,
  TransferData,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { transferConfigToS3ClientWrapper } from "./BackendHelpers";
import { S3ConfigDownloadInput, S3ConfigUploadInput } from "./Interfaces";
import { S3FrontendStorage } from "./S3ClientStorage";
import { FrontendS3ClientWrapper } from "./S3ClientWrapper";

export class S3ClientStorage extends S3FrontendStorage {
  protected override getClientWrapper(
    transferConfig: TransferConfig,
    bucket: string
  ): FrontendS3ClientWrapper {
    return transferConfigToS3ClientWrapper(transferConfig, bucket);
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
    if (instanceOfUrlDownloadInput(input)) return downloadFromUrl(input);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.download(input as any);
  }

  public override async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    return super.upload({
      ...input,
      data:
        typeof input.data === "string"
          ? createReadStream(input.data)
          : input.data,
    });
  }
}
