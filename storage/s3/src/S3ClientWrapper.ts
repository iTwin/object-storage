/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import { S3Client } from "@aws-sdk/client-s3";
import { inject } from "inversify";

import {
  assertLocalFile,
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectReference,
  streamToLocalFile,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { S3FrontendClientWrapper } from "./S3FrontendClientWrapper";
import { Types } from "./Types";

export class S3ClientWrapper extends S3FrontendClientWrapper {
  public constructor(client: S3Client, @inject(Types.bucket) bucket: string) {
    super(client, bucket);
  }
  protected override async streamToTransferType(
    stream: Readable,
    transferType: TransferType,
    localPath?: string
  ): Promise<TransferData> {
    if (transferType === "local") {
      assertLocalFile(localPath);

      await streamToLocalFile(stream, localPath);

      return localPath;
    }
    return super.streamToTransferType(stream, transferType, localPath);
  }

  public override async upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata
  ): Promise<void> {
    if (typeof data === "string") data = createReadStream(data); // read from local file
    return super.upload(reference, data, metadata);
  }

  public override async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    if (typeof data === "string") data = createReadStream(data); // read from local file
    return super.uploadInMultipleParts(reference, data, options);
  }
}
