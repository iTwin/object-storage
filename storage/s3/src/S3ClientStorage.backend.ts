import { Readable } from "stream";

import {
  downloadFromUrl,
  instanceOfUrlDownloadInput,
  TransferConfig,
  TransferData,
  UrlDownloadInput,
} from "@itwin/object-storage-core";

import { transferConfigToS3ClientWrapper } from "./BackendHelpers";
import { S3ConfigDownloadInput } from "./Interfaces";
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
    return super.download(input as any); // eslint-disable-line @typescript-eslint/no-explicit-any -- Typescript wants to pick one overload instead of using the unified signature, and neither one fits.
  }
}
