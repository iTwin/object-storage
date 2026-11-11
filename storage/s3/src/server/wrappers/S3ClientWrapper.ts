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
import type { HttpHandlerOptions, HttpRequest } from "@aws-sdk/types";

import {
  buildObjectKey,
  buildObjectReference,
} from "@itwin/object-storage-core/lib/common/internal";
import {
  bufferToChunkedStream,
  createUploadProgressHandler,
  streamToBuffer,
  throwIfAborted,
  UploadProgressHandler,
} from "@itwin/object-storage-core/lib/server/internal";

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
  TransferProgressCallback,
} from "@itwin/object-storage-core";

export class S3ClientWrapper {
  public constructor(
    protected readonly _client: S3Client,
    protected readonly _bucket: string
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
    headers?: ContentHeaders,
    transferOptions?: {
      abortSignal?: AbortSignal;
      onProgress?: TransferProgressCallback;
    }
  ): Promise<void> {
    const { abortSignal, onProgress } = transferOptions ?? {};
    throwIfAborted(abortSignal);
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

    const command = new PutObjectCommand(input);
    const progress = createUploadProgressHandler(
      onProgress,
      ArrayBuffer.isView(input.Body) ? input.Body.byteLength : undefined
    );
    if (progress) S3ClientWrapper.addProgressMiddleware(command, progress);
    await this._client.send(command, { abortSignal });
  }

  public async uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    headers?: ContentHeaders,
    transferOptions?: {
      abortSignal?: AbortSignal;
      onProgress?: TransferProgressCallback;
    }
  ): Promise<void> {
    const { abortSignal, onProgress } = transferOptions ?? {};
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

    // lib-storage computes the total (Buffer length or file size for
    // fs.ReadStream).
    const progress = createUploadProgressHandler(onProgress);
    if (progress)
      upload.on("httpUploadProgress", (event) =>
        progress(event.loaded ?? 0, event.total)
      );

    const onAbort = (): void => {
      void upload.abort();
    };
    abortSignal?.addEventListener("abort", onAbort, { once: true });
    try {
      throwIfAborted(abortSignal);
      await upload.done();
    } finally {
      abortSignal?.removeEventListener("abort", onAbort);
    }
  }

  /**
   * Swaps the Buffer body of every attempt for a stream of chunks, so that
   * progress is reported as the HTTP handler reads the body. The original
   * request is not modified, because the retry middleware reuses it.
   */
  private static addProgressMiddleware(
    command: PutObjectCommand,
    progress: UploadProgressHandler
  ): void {
    command.middlewareStack.add(
      (next) => async (args) => {
        const request = args.request as HttpRequest;
        if (!ArrayBuffer.isView(request.body)) return next(args);

        progress(0);
        const progressRequest: HttpRequest = Object.assign(
          Object.create(Object.getPrototypeOf(request) as object) as object,
          request,
          {
            headers: { ...request.headers },
            body: bufferToChunkedStream(request.body, undefined, progress),
          }
        );
        return next({ ...args, request: progressRequest });
      },
      {
        step: "deserialize",
        priority: "low",
        name: "objectStorageUploadProgressMiddleware",
      }
    );
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
    const page: EntityCollectionPage<BaseDirectory> = {
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
    return page;
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
        Prefix: `${directory.baseDirectory}/`,
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
    const page: EntityCollectionPage<ObjectReference> = {
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
    return page;
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

  public async copyObject(
    bucket: string,
    sourceReference: ObjectReference,
    targetReference: ObjectReference
  ): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */
    await this._client.send(
      new CopyObjectCommand({
        CopySource: `${bucket}/${buildObjectKey(sourceReference)}`,
        Bucket: this._bucket,
        Key: buildObjectKey(targetReference),
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

  public get bucketName(): string {
    return this._bucket;
  }

  public releaseResources(): void {
    this._client.destroy();
  }
}
