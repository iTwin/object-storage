/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import axios, { AxiosError, AxiosInstance } from "axios";

import { ObjectProperties, TransferConfig } from "@itwin/object-storage-core";

import * as Common from "./Common";

export class ServerStorageProxyFrontend {
  private readonly _axiosClient: AxiosInstance;

  constructor(baseURL: string) {
    this._axiosClient = axios.create({
      baseURL,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Content-Type": "application/json",
      },
    });
  }

  private async post<TResponse>(
    url: string,
    data?: unknown
  ): Promise<TResponse> {
    return this._axiosClient
      .post<TResponse>(url, data)
      .then((response) => {
        return response.data;
      })
      .catch((error: AxiosError) => {
        throw new Error(
          `${ServerStorageProxyFrontend.name} ERROR: ${error.response?.status} "${url}"`
        );
      });
  }

  public async download(request: Common.DownloadRequest): Promise<string> {
    return this.post<string>(Common.DOWNLOAD_REQUEST_PATH, request);
  }

  public async upload(request: Common.UploadRequest): Promise<void> {
    return this.post(Common.UPLOAD_REQUEST_PATH, request);
  }

  public async createBaseDirectory(
    request: Common.CreateBaseDirectoryRequest
  ): Promise<void> {
    return this.post(Common.CREATE_BASE_DIRECTORY_REQUEST_PATH, request);
  }

  public async deleteBaseDirectory(
    request: Common.DeleteBaseDirectoryRequest
  ): Promise<void> {
    return this.post(Common.DELETE_BASE_DIRECTORY_REQUEST_PATH, request);
  }

  public async deleteObject(
    request: Common.DeleteBaseDirectoryRequest
  ): Promise<void> {
    return this.post(Common.DELETE_OBJECT_REQUEST_PATH, request);
  }

  public async baseDirectoryExists(
    request: Common.BaseDirectoryExistsRequest
  ): Promise<boolean> {
    return this.post<boolean>(
      Common.BASE_DIRECTORY_EXISTS_REQUEST_PATH,
      request
    );
  }

  public async objectExists(
    request: Common.ObjectExistsRequest
  ): Promise<boolean> {
    return this.post<boolean>(Common.OBJECT_EXISTS_REQUEST_PATH, request);
  }

  public async getObjectProperties(
    request: Common.GetObjectPropertiesRequest
  ): Promise<ObjectProperties> {
    const properties = await this.post<ObjectProperties>(
      Common.GET_OBJECT_PROPERTIES_REQUEST_PATH,
      request
    );
    properties.lastModified = new Date(
      properties.lastModified as unknown as string
    );
    return properties;
  }

  public async getDownloadUrl(
    request: Common.GetDownloadUrlRequest
  ): Promise<string> {
    return this.post<string>(Common.GET_DOWNLOAD_URL_REQUEST_PATH, request);
  }

  public async getUploadUrl(
    request: Common.GetUploadUrlRequest
  ): Promise<string> {
    return this.post<string>(Common.GET_UPLOAD_URL_REQUEST_PATH, request);
  }

  public async getDownloadConfig(
    request: Common.GetDownloadConfigRequest
  ): Promise<TransferConfig> {
    const config = await this.post<TransferConfig>(
      Common.GET_DOWNLOAD_CONFIG_REQUEST_PATH,
      request
    );
    config.expiration = new Date(config.expiration as unknown as string);
    return config;
  }

  public async getUploadConfig(
    request: Common.GetUploadConfigRequest
  ): Promise<TransferConfig> {
    const config = await this.post<TransferConfig>(
      Common.GET_UPLOAD_CONFIG_REQUEST_PATH,
      request
    );
    config.expiration = new Date(config.expiration as unknown as string);
    return config;
  }
}
