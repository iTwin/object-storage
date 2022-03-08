/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { injectable } from "inversify";

import {
  Metadata,
  MultipartUploadData,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  TransferConfig,
  TransferData,
  TransferType,
} from ".";

@injectable()
export abstract class ServerStorage
  implements PresignedUrlProvider, TransferConfigProvider
{
  public abstract download(
    reference: ObjectReference,
    transferType: "buffer"
  ): Promise<Buffer>;

  public abstract download(
    reference: ObjectReference,
    transferType: "stream"
  ): Promise<Readable>;

  public abstract download(
    reference: ObjectReference,
    transferType: "local",
    localPath?: string
  ): Promise<string>;

  public abstract download(
    reference: ObjectReference,
    transferType: TransferType,
    localPath?: string
  ): Promise<TransferData>;

  public abstract upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions
  ): Promise<void>;

  public abstract create(directory: ObjectDirectory): Promise<void>;

  public abstract list(directory: ObjectDirectory): Promise<ObjectReference[]>;

  /**
   * Deletes the specified resource which is either an object or a directory. Note
   * that some storage providers (Azure, for example) do not immediately delete
   * all associated resources and cleanup can take up to several minutes. To check
   * if the resource has been deleted use the {@link exists} method.
   * @param {ObjectDirectory | ObjectReference} reference object or directory reference
   * @returns {Promise<void>}
   */
  public abstract delete(
    reference: ObjectDirectory | ObjectReference
  ): Promise<void>;

  /**
   * Checks if the specified resource has been deleted.
   * @param {ObjectDirectory | ObjectReference} reference object or directory reference
   * @returns `true` if the resource has not been deleted, `false` otherwise.
   */
  public abstract exists(
    reference: ObjectDirectory | ObjectReference
  ): Promise<boolean>;

  public abstract updateMetadata(
    reference: ObjectReference,
    metadata: Metadata
  ): Promise<void>;

  public abstract getObjectProperties(
    reference: ObjectReference
  ): Promise<ObjectProperties>;

  public abstract getDownloadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string>;
  public abstract getUploadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string>;

  /** Azure will only be limited to baseDirectory. */
  public abstract getDownloadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
  ): Promise<TransferConfig>;
  /** Azure will only be limited to baseDirectory. */
  public abstract getUploadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
  ): Promise<TransferConfig>;

  /**
   * Closes underlying resources, sockets for example. Clients should call this
   * method after an instance of this class is not used anymore to free the
   * resources and avoid hanging processes or similar issues.
   */
  public abstract releaseResources(): void;
}

export interface PresignedUrlProvider {
  getDownloadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string>;
  getUploadUrl(
    reference: ObjectReference,
    expiresInSeconds?: number
  ): Promise<string>;
}

export interface TransferConfigProvider {
  getDownloadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
  ): Promise<TransferConfig>;
  getUploadConfig(
    directory: ObjectDirectory,
    expiresInSeconds?: number
  ): Promise<TransferConfig>;
}

export function instanceOfObjectReference(
  reference: ObjectDirectory | ObjectReference
): reference is ObjectReference {
  return "objectName" in reference;
}
