/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

export type FrontendTransferType = "buffer" | "stream";
export type FrontendTransferData = Buffer | Readable;
export type FrontendMultipartUploadData = Readable;

export type TransferType = FrontendTransferType | "local";
export type TransferData = FrontendTransferData | string;
export type MultipartUploadData = FrontendMultipartUploadData | string;

export interface Metadata {
  [key: string]: string;
}

export interface MultipartUploadOptions {
  partSize?: number;
  queueSize?: number;
  metadata?: Metadata;
}

export interface BaseDirectory {
  /** Container for Azure. First directory of a prefix for S3. */
  baseDirectory: string;
}

export interface ObjectDirectory extends BaseDirectory {
  /** Additional directories in the path to object. */
  relativeDirectory?: string;
}

export interface ObjectReference extends ObjectDirectory {
  objectName: string;
}

export interface TransferConfig {
  baseUrl: string;
  expiration: Date;
}

export interface ObjectProperties {
  reference: ObjectReference;
  size: number;
  lastModified: Date;
  metadata?: Metadata;
}

export interface FrontendUrlDownloadInput {
  url: string;
  transferType: FrontendTransferType;
}

export interface UrlDownloadInput extends Omit<FrontendUrlDownloadInput, "transferType"> {
  transferType: TransferType;
  localPath?: string;
}

export interface FrontendUrlUploadInput {
  url: string;
  data: FrontendTransferData;
  metadata?: Metadata;
}

export interface UrlUploadInput extends Omit<FrontendUrlUploadInput, "data"> {
  data: TransferData;
}

export interface FrontendConfigDownloadInput {
  reference: ObjectReference;
  transferType: FrontendTransferType;
  transferConfig: TransferConfig;
  localPath?: string;
}

export interface ConfigDownloadInput extends Omit<FrontendConfigDownloadInput, "transferType"> {
  transferType: TransferType;
}

export interface FrontendConfigUploadInput {
  reference: ObjectReference;
  data: FrontendTransferData;
  transferConfig: TransferConfig;
  metadata?: Metadata;
}

export interface ConfigUploadInput extends Omit<FrontendConfigUploadInput, "data"> {
  data: TransferData;
}

export interface FrontendUploadInMultiplePartsInput {
  reference: ObjectReference;
  data: FrontendMultipartUploadData;
  transferConfig: TransferConfig;
  options?: MultipartUploadOptions;
}

export interface UploadInMultiplePartsInput extends Omit<FrontendUploadInMultiplePartsInput, "data"> {
  data: MultipartUploadData;
}

export function instanceOfUrlDownloadInput(
  input: unknown
): input is UrlDownloadInput {
  return "url" in (input as UrlDownloadInput);
}

export function instanceOfUrlUploadInput(
  input: unknown
): input is UrlUploadInput {
  return "url" in (input as UrlUploadInput);
}

export function instanceOfUrlInput(
  input: unknown
): input is UrlDownloadInput | UrlUploadInput {
  return "url" in (input as UrlDownloadInput);
}