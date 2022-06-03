/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ObjectProperties, TransferConfig } from "@itwin/object-storage-core";
import axios, { AxiosError } from "axios";
import * as Common from "./Common";

export class ServerStorageProxyFrontend {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly _headers = {
    "Content-Type": "application/json"
  };

  constructor(
    private readonly _baseUrl: string
  ) { }
  
  private post<TResponse>(url: string, data?: any): Promise<TResponse> {
    return axios
      .post<TResponse>(url, data, {
        baseURL: this._baseUrl,
        headers: this._headers,
      })
      .then(response => { return response.data; })
      .catch((error: AxiosError) => {
        throw new Error(
          `${ServerStorageProxyFrontend.name} ERROR: ${error.response?.status} "${url}"`
        );
      });
  }

  public async download(request: Common.DownloadRequest): Promise<string> {
    return this.post<string>(Common.DownloadRequestPath, request);
  }

  public async upload(request: Common.UploadRequest): Promise<void> {
    return this.post(Common.UploadRequestPath, request);
  }

  public async createBaseDirectory(request: Common.CreateBaseDirectoryRequest): Promise<void> {
    return this.post(Common.CreateBaseDirectoryRequestPath, request);
  }

  public async deleteBaseDirectory(request: Common.DeleteBaseDirectoryRequest): Promise<void> {
    return this.post(Common.DeleteBaseDirectoryRequestPath, request);
  }

  public async deleteObject(request: Common.DeleteBaseDirectoryRequest): Promise<void> {
    return this.post(Common.DeleteObjectRequestPath, request);
  }

  public async baseDirectoryExists(request: Common.BaseDirectoryExistsRequest): Promise<boolean> {
    return await this.post<boolean>(Common.BaseDirectoryExistsRequestPath, request);
  }

  public async objectExists(request: Common.ObjectExistsRequest): Promise<boolean> {
    return this.post<boolean>(Common.ObjectExistsRequestPath, request);
  }

  public async getObjectProperties(request: Common.GetObjectPropertiesRequest): Promise<ObjectProperties> {
    const properties = await this.post<ObjectProperties>(Common.GetObjectPropertiesRequestPath, request);
    properties.lastModified = new Date(properties.lastModified as unknown as string);
    return properties;
  }

  public async getDownloadUrl(request: Common.GetDownloadUrlRequest): Promise<string> {
    return this.post<string>(Common.GetDownloadUrlRequestPath, request);
  }

  public async getUploadUrl(request: Common.GetUploadUrlRequest): Promise<string> {
    return this.post<string>(Common.GetUploadUrlRequestPath, request);
  }

  public async getDownloadConfig(request: Common.GetDownloadConfigRequest): Promise<TransferConfig> {
    const config = await this.post<TransferConfig>(Common.GetDownloadConfigRequestPath, request);
    config.expiration = new Date(config.expiration as unknown as string);
    return config;
  }

  public async getUploadConfig(request: Common.GetUploadConfigRequest): Promise<TransferConfig> {
    const config = await this.post<TransferConfig>(Common.GetUploadConfigRequestPath, request);
    config.expiration = new Date(config.expiration as unknown as string);
    return config;
  }
}