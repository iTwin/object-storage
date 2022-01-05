/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { inject, injectable } from "inversify";

import {
  buildObjectDirectoryString,
  buildObjectKey,
  buildObjectReference,
  Metadata,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  streamToBuffer,
  streamToLocalFile,
  TransferData,
  TransferType,
} from "@itwin/object-storage-core";

import { Types } from "./Types";

@injectable()
export class S3ClientWrapper {
  private readonly _client;
  private readonly _bucket;

  public constructor(client: S3Client, @inject(Types.bucket) bucket: string) {
    this._client = client;
    this._bucket = bucket;
  }

  public async download(
    reference: ObjectReference,
    transferType: TransferType,
    localPath?: string
  ): Promise<TransferData> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const { Body } = await this._client.send(
      new GetObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    const stream = Body! as Readable;

    switch (transferType) {
      case "buffer":
        return streamToBuffer(stream);

      case "stream":
        return stream;

      case "local":
        if (!localPath) throw new Error("Specify localPath");

        await streamToLocalFile(stream, localPath);

        return localPath;

      default:
        throw new Error(`Type '${transferType}' is not supported`);
    }
  }

  public async upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata
  ): Promise<void> {
    if (typeof data === "string") data = createReadStream(data); // read from local file

    /* eslint-disable @typescript-eslint/naming-convention */
    await this._client.send(
      new PutObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
        Body: data,
        Metadata: metadata,
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: TransferData,
    options?: MultipartUploadOptions
  ): Promise<void> {
    if (typeof data === "string") data = createReadStream(data); // read from local file

    const { queueSize, partSize, metadata } = options ?? {};

    /* eslint-disable @typescript-eslint/naming-convention */
    const upload = new Upload({
      client: this._client,
      queueSize,
      partSize,
      leavePartsOnError: false,
      params: {
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
        Body: data,
        Metadata: metadata,
      },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    await upload.done();
  }

  public async list(directory: ObjectDirectory): Promise<ObjectReference[]> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const { Contents } = await this._client.send(
      new ListObjectsV2Command({
        Bucket: this._bucket,
        Prefix: buildObjectDirectoryString(directory),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    return Contents?.map((object) => buildObjectReference(object.Key!)) ?? [];
  }

  public async remove(reference: ObjectReference): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */
    await this._client.send(
      new DeleteObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  public async exists(reference: ObjectReference): Promise<boolean> {
    try {
      return !!(await this.getObjectProperties(reference));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.name === "NotFound") return false;
      throw error;
    }
  }

  public async updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */
    await this._client.send(
      new CopyObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
        CopySource: `${this._bucket}/${buildObjectKey(reference)}`,
        Metadata: metadata,
        MetadataDirective: "REPLACE",
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  public async getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const {
      LastModified,
      ContentLength,
      Metadata: metadata,
    } = await this._client.send(
      new HeadObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    return {
      reference,
      lastModified: LastModified!,
      size: ContentLength!,
      metadata,
    };
  }
}
