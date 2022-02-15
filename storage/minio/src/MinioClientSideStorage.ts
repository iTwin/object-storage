/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { createReadStream, promises } from "fs";
import { Readable } from "stream";

import {
  ConfigUploadInput,
  instanceOfUrlUploadInput,
  metadataToHeaders,
  streamToBuffer,
  uploadToUrl,
  UrlUploadInput,
} from "@itwin/object-storage-core";
import { S3ClientSideStorage } from "@itwin/object-storage-s3";

export class MinioClientSideStorage extends S3ClientSideStorage {
  public override async upload(
    input: UrlUploadInput | ConfigUploadInput
  ): Promise<void> {
    if (instanceOfUrlUploadInput(input)) {
      // minio responds with 411 error if Content-Length header is not present
      // used streamToBuffer to get the length before uploading for streams
      const { data, metadata, url } = input;

      const metaHeaders = metadata
        ? metadataToHeaders(metadata, "x-amz-meta-")
        : undefined;

      const headers = {
        ...metaHeaders,
      };

      const dataToUpload =
        typeof data === "string"
          ? createReadStream(data)
          : data instanceof Readable
          ? await streamToBuffer(data)
          : data;

      const size =
        typeof data === "string"
          ? (await promises.stat(data)).size
          : (dataToUpload as Buffer).byteLength;

      headers["Content-Length"] = size.toString();

      return uploadToUrl(url, dataToUpload, headers);
    } else {
      return super.upload(input);
    }
  }
}
