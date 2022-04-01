import { createReadStream } from "fs";

import {
  instanceOfUrlUploadInput,
  streamToBuffer,
  UrlUploadInput,
} from "@itwin/object-storage-core";
import { S3ClientStorage, S3ConfigUploadInput } from "@itwin/object-storage-s3";

import { handleMinioUrlUpload } from "./MinioClientStorage";

export class MinioClientStorage extends S3ClientStorage {
  public override async upload(
    input: UrlUploadInput | S3ConfigUploadInput
  ): Promise<void> {
    if (typeof input.data === "string")
      input = {
        ...input,
        data: await streamToBuffer(createReadStream(input.data)),
      };
    if (instanceOfUrlUploadInput(input)) {
      return handleMinioUrlUpload(input);
    } else {
      return super.upload(input);
    }
  }
}
