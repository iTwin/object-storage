/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";

import axios from "axios";

import {
  ConfigUploadInput,
  instanceOfUrlUploadInput,
  streamToBuffer,
  UrlUploadInput,
} from "@itwin/object-storage-core";
import {
  metadataToHeaders,
  S3ClientSideStorage,
} from "@itwin/object-storage-s3";

export class MinioClientSideStorage extends S3ClientSideStorage {
  public override async upload(
    input: UrlUploadInput | ConfigUploadInput
  ): Promise<void> {
    if (instanceOfUrlUploadInput(input)) {
      // minio responds with 411 error if Content-Length header is not present
      // used streamToBuffer to get the length before uploading for streams

      const metaHeaders = input.metadata
        ? metadataToHeaders(input.metadata)
        : undefined;

      const headers = {
        ...metaHeaders,
      };

      const data =
        typeof input.data === "string"
          ? createReadStream(input.data)
          : input.data instanceof Readable
          ? await streamToBuffer(input.data)
          : input.data;

      const size =
        typeof input.data === "string"
          ? (await stat(input.data)).size
          : (data as Buffer).byteLength;

      headers["Content-Length"] = size.toString();

      await axios.put(input.url, data, {
        headers,
      });
    } else {
      return super.upload(input);
    }
  }
}
