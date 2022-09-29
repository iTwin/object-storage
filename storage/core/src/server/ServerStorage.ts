/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { injectable } from "inversify";

import {
  BaseDirectory,
  Metadata,
  MultipartUploadOptions,
  ObjectDirectory,
  ObjectProperties,
  ObjectReference,
  TransferConfig,
} from "../common";

import { MultipartUploadData, TransferData } from "./Interfaces";

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

  public abstract upload(
    reference: ObjectReference,
    data: TransferData,
    metadata?: Metadata,
    contentEncoding?: string
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    reference: ObjectReference,
    data: MultipartUploadData,
    options?: MultipartUploadOptions,
    contentEncoding?: string
  ): Promise<void>;

  public abstract createBaseDirectory(directory: BaseDirectory): Promise<void>;

  public abstract listDirectories(): Promise<BaseDirectory[]>;

  public abstract listObjects(
    directory: BaseDirectory
  ): Promise<ObjectReference[]>;

  /**
   * @deprecated Use listObjects method instead.
   */
  // eslint-disable-next-line deprecation/deprecation
  public abstract list(directory: BaseDirectory): Promise<ObjectReference[]>;

  /**
   * Deletes the specified directory. Note that some storage providers (Azure,
   * for example) do not immediately delete all associated resources and cleanup
   * can take up to several minutes. To check if the resource has been deleted
   * use the {@link exists} method.
   * @param {BaseDirectory} directory base directory
   * @returns {Promise<void>}
   */
  public abstract deleteBaseDirectory(directory: BaseDirectory): Promise<void>;
  /**
   * Deletes the specified object. Note that some storage providers (Azure, for
   * example) do not immediately delete all associated resources and cleanup can
   * take up to several minutes. To check if the resource has been deleted use
   * the {@link exists} method.
   * @param {ObjectReference} reference object reference
   * @returns {Promise<void>}
   */
  public abstract deleteObject(reference: ObjectReference): Promise<void>;

  /**
   * Checks if the specified directory has been deleted.
   * @param {BaseDirectory} directory base directory
   * @returns `true` if the resource has not been deleted, `false` otherwise.
   */
  public abstract baseDirectoryExists(
    directory: BaseDirectory
  ): Promise<boolean>;
  /**
   * Checks if the specified object has been deleted.
   * @param {ObjectReference} reference object reference
   * @returns `true` if the resource has not been deleted, `false` otherwise.
   */
  public abstract objectExists(reference: ObjectReference): Promise<boolean>;

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
