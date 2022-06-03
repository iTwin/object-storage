/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BaseDirectory, Metadata, ObjectDirectory, ObjectReference } from "@itwin/object-storage-core";

export const BasePath = "/storage";

export const DownloadRequestPath = `${BasePath}/download`;
export interface DownloadRequest {
  reference: ObjectReference;
}

export const UploadRequestPath = `${BasePath}/upload`;
export interface UploadRequest {
  reference: ObjectReference;
  data: string;
  metadata?: Metadata;
}

export const CreateBaseDirectoryRequestPath = `${BasePath}/createBaseDirectory`;
export interface CreateBaseDirectoryRequest {
  directory: BaseDirectory;
}

export const DeleteBaseDirectoryRequestPath = `${BasePath}/deleteBaseDirectory`;
export interface DeleteBaseDirectoryRequest {
  directory: BaseDirectory;
}

export const DeleteObjectRequestPath = `${BasePath}/deleteObjectRequestPath`;
export interface DeleteObjectRequest {
  reference: ObjectReference;
}

export const BaseDirectoryExistsRequestPath = `${BasePath}/baseDirectoryExists`;
export interface BaseDirectoryExistsRequest {
  directory: BaseDirectory;
}

export const ObjectExistsRequestPath = `${BasePath}/objectExists`;
export interface ObjectExistsRequest {
  reference: ObjectReference;
}

export const GetObjectPropertiesRequestPath = `${BasePath}/getObjectProperties`;
export interface GetObjectPropertiesRequest {
  reference: ObjectReference
};

export const GetDownloadUrlRequestPath = `${BasePath}/getDownloadUrl`;
export interface GetDownloadUrlRequest {
  reference: ObjectReference;
  expiresInSeconds?: number;
}

export const GetUploadUrlRequestPath = `${BasePath}/getUploadUrl`;
export interface GetUploadUrlRequest {
  reference: ObjectReference;
  expiresInSeconds?: number;
}

export const GetDownloadConfigRequestPath = `${BasePath}/getDownloadConfig`;
export interface GetDownloadConfigRequest {
  directory: ObjectDirectory;
  expiresInSeconds?: number;
};

export const GetUploadConfigRequestPath = `${BasePath}/getUploadConfig`;
export interface GetUploadConfigRequest {
  directory: ObjectDirectory;
  expiresInSeconds?: number;
}