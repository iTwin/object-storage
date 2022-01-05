/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import axios from "axios";
import { inject, injectable } from "inversify";

import {
  ClientSideStorage,
  ConfigDownloadInput,
  ConfigUploadInput,
  instanceOfUrlDownloadInput,
  instanceOfUrlUploadInput,
  streamToLocalFile,
  TransferData,
  UploadInMultiplePartsInput,
  UrlDownloadInput,
  UrlUploadInput,
} from "@itwin/object-storage-core";

import { metadataToHeaders, transferConfigToS3ClientWrapper } from "./Helpers";
import { Types } from "./Types";

export interface S3ClientSideStorageConfig {
  bucket: string;
}

@injectable()
export class S3ClientSideStorage extends ClientSideStorage {
  private readonly _bucket: string;

  public constructor(
    @inject(Types.S3ServerSide.config) config: S3ClientSideStorageConfig
  ) {
    super();

    this._bucket = config.bucket;
  }

  public async download(
    input: UrlDownloadInput | ConfigDownloadInput
  ): Promise<TransferData> {
    if (instanceOfUrlDownloadInput(input)) {
      switch (input.transferType) {
        case "buffer":
          const bufferResponse = await axios.get(input.url, {
            responseType: "arraybuffer",
          });
          return bufferResponse.data as Buffer;

        case "stream":
          const streamResponse = await axios.get(input.url, {
            responseType: "stream",
          });
          return streamResponse.data as Readable;

        case "local":
          const path = input.localPath;

          if (!path) throw new Error("Specify localPath");

          const localResponse = await axios.get(input.url, {
            responseType: "stream",
          });

          await streamToLocalFile(localResponse.data, path);

          return path;

        default:
          throw new Error(`Type '${input.transferType}' is not supported`);
      }
    } else {
      return transferConfigToS3ClientWrapper(
        input.transferConfig,
        this._bucket
      ).download(input.reference, input.transferType, input.localPath);
    }
  }

  public async upload(
    input: UrlUploadInput | ConfigUploadInput
  ): Promise<void> {
    if (instanceOfUrlUploadInput(input)) {
      const metaHeaders = input.metadata
        ? metadataToHeaders(input.metadata)
        : undefined;

      await axios.put(
        input.url,
        typeof input.data === "string"
          ? createReadStream(input.data)
          : input.data,
        {
          headers: metaHeaders,
        }
      );
    } else {
      return transferConfigToS3ClientWrapper(
        input.transferConfig,
        this._bucket
      ).upload(input.reference, input.data, input.metadata);
    }
  }

  public async uploadInMultipleParts(
    input: UploadInMultiplePartsInput
  ): Promise<void> {
    return transferConfigToS3ClientWrapper(
      input.transferConfig,
      this._bucket
    ).uploadInMultipleParts(input.reference, input.data, input.options);
  }
}
