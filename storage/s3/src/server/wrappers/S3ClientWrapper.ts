/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { inject, injectable } from "inversify";

import {
  buildObjectKey,
  buildObjectReference,
} from "@itwin/object-storage-core/lib/common/internal";
import { streamToBuffer } from "@itwin/object-storage-core/lib/server/internal";

import {
  BaseDirectory,
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectProperties,
  ObjectReference,
  TransferData,
} from "@itwin/object-storage-core";

import { Types } from "../../common";

@injectable()
export class S3ClientWrapper {
  public constructor(
    protected readonly _client: S3Client,
    @inject(Types.bucket) protected readonly _bucket: string
  ) {}

  public async download(reference: ObjectReference): Promise<Readable> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const { Body } = await this._client.send(
      new GetObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    if (Body instanceof Readable) return Body;
    throw new Error("Unexpected body type");
  }

  public async upload(
    reference: ObjectReference,
    data?: TransferData,
    metadata?: Metadata
  ): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const input: PutObjectCommandInput = {
      Bucket: this._bucket,
      Key: buildObjectKey(reference),
      Metadata: metadata,
    };
    /* eslint-enable @typescript-eslint/naming-convention */
    if (data)
      input.Body = data instanceof Readable ? await streamToBuffer(data) : data;
    else input.ContentLength = 0;
    await this._client.send(new PutObjectCommand(input));
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void> {
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

  public async listDirectories(): Promise<BaseDirectory[]> {
    let truncated: boolean | undefined = true;
    let continuationToken: string | undefined;
    let directories: BaseDirectory[] = [];
    while (truncated) {
      /* eslint-disable @typescript-eslint/naming-convention */
      const response = await this._client.send(
        new ListObjectsV2Command({
          Bucket: this._bucket,
          ContinuationToken: continuationToken,
          Delimiter: "/",
        })
      );
      directories = directories.concat(
        response.CommonPrefixes?.map(
          (entry) =>
            ({ baseDirectory: entry.Prefix?.slice(0, -1) } as BaseDirectory)
        ) ?? []
      );
      truncated = response.IsTruncated;
      if (response.IsTruncated) {
        continuationToken = response.NextContinuationToken;
      }
    }
    const uniqueBaseDirectories = Array.from(new Set(directories).values());
    return uniqueBaseDirectories;
  }

  public async listObjects(
    directory: BaseDirectory,
    options?: {
      maxResults?: number;
      includeEmptyFiles?: boolean;
    }
  ): Promise<ObjectReference[]> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const { Contents } = await this._client.send(
      new ListObjectsV2Command({
        Bucket: this._bucket,
        Prefix: directory.baseDirectory,
        MaxKeys: options?.maxResults,
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    const references =
      Contents?.map((object) => buildObjectReference(object.Key!)) ?? [];
    if (options?.includeEmptyFiles) return references;

    const nonEmptyReferences = references.filter((ref) => !!ref.objectName);
    return nonEmptyReferences;
  }

  public async deleteObject(reference: ObjectReference): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */
    await this._client.send(
      new DeleteObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      })
    );
    /* eslint-enable @typescript-eslint/naming-convention */
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

  public async objectExists(reference: ObjectReference): Promise<boolean> {
    try {
      return !!(await this.getObjectProperties(reference));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.name === "NotFound") return false;
      throw error;
    }
  }

  public async prefixExists(directory: BaseDirectory): Promise<boolean> {
    const filesWithPrefix: ObjectReference[] = await this.listObjects(
      directory,
      {
        maxResults: 1,
        includeEmptyFiles: true,
      }
    );
    return filesWithPrefix.length !== 0;
  }

  public releaseResources(): void {
    this._client.destroy();
  }
}
