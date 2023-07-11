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
import type { HttpHandlerOptions } from "@aws-sdk/types";
import { inject, injectable } from "inversify";

import {
  buildObjectKey,
  buildObjectReference,
} from "@itwin/object-storage-core/lib/common/internal";
import { streamToBuffer } from "@itwin/object-storage-core/lib/server/internal";

import {
  BaseDirectory,
  ContentHeaders,
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectProperties,
  EntityCollectionPage,
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

  public async download(
    reference: ObjectReference,
    options?: HttpHandlerOptions
  ): Promise<Readable> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const { Body } = await this._client.send(
      new GetObjectCommand({
        Bucket: this._bucket,
        Key: buildObjectKey(reference),
      }),
      options
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    if (Body instanceof Readable) return Body;
    throw new Error("Unexpected body type");
  }

  public async upload(
    reference: ObjectReference,
    data?: TransferData,
    metadata?: Metadata,
    headers?: ContentHeaders
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
    input.ContentEncoding = headers?.contentEncoding;
    input.CacheControl = headers?.cacheControl;
    input.ContentType = headers?.contentType;
    await this._client.send(new PutObjectCommand(input));
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    headers?: ContentHeaders
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
        ContentEncoding: headers?.contentEncoding,
        CacheControl: headers?.cacheControl,
        ContentType: headers?.contentType,
      },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    await upload.done();
  }

  public async getDirectoriesNextPage(options: {
    maxPageSize: number;
    continuationToken?: string;
  }): Promise<EntityCollectionPage<BaseDirectory>> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const response = await this._client.send(
      new ListObjectsV2Command({
        Bucket: this._bucket,
        ContinuationToken: options.continuationToken,
        // add delimiter to get list of directories in the response.
        // See https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-prefixes.html
        Delimiter: "/",
        MaxKeys: options.maxPageSize,
      })
    );
    const directories: BaseDirectory[] =
      response.CommonPrefixes?.map(
        (entry) =>
          // removing last character which is a slash to have directory name
          ({ baseDirectory: entry.Prefix?.slice(0, -1) } as BaseDirectory)
      ) ?? [];
    const continuationToken = response.NextContinuationToken;
    const uniqueBaseDirectories = Array.from(new Set(directories).values());
    const ret: EntityCollectionPage<BaseDirectory> = {
      entities: uniqueBaseDirectories,
      next:
        continuationToken == undefined
          ? undefined
          : () =>
              this.getDirectoriesNextPage({
                maxPageSize: options.maxPageSize,
                continuationToken: continuationToken,
              }),
    };
    return ret;
  }

  public async getObjectsNextPage(
    directory: BaseDirectory,
    options: {
      maxPageSize: number;
      continuationToken?: string;
      includeEmptyFiles?: boolean;
    }
  ): Promise<EntityCollectionPage<ObjectReference>> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const response = await this._client.send(
      new ListObjectsV2Command({
        Bucket: this._bucket,
        Prefix: directory.baseDirectory,
        ContinuationToken: options.continuationToken,
        MaxKeys: options.maxPageSize,
      })
    );
    /* eslint-disable @typescript-eslint/naming-convention */
    let references =
      response.Contents?.map((object) => buildObjectReference(object.Key!)) ??
      [];
    const continuationToken = response.NextContinuationToken;
    if (!options?.includeEmptyFiles) {
      references = references.filter((ref) => !!ref.objectName);
    }
    const ret: EntityCollectionPage<ObjectReference> = {
      entities: references,
      next:
        continuationToken == undefined
          ? undefined
          : () =>
              this.getObjectsNextPage(directory, {
                maxPageSize: options.maxPageSize,
                continuationToken: continuationToken,
                includeEmptyFiles: options.includeEmptyFiles,
              }),
    };
    return ret;
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
      ContentEncoding: contentEncoding,
      ContentType: contentType,
      CacheControl: cacheControl,
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
      contentEncoding,
      contentType,
      cacheControl,
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
    const filesWithPrefix: EntityCollectionPage<ObjectReference> =
      await this.getObjectsNextPage(directory, {
        maxPageSize: 1,
        includeEmptyFiles: true,
      });
    return filesWithPrefix.entities.length !== 0;
  }

  public releaseResources(): void {
    this._client.destroy();
  }
}
