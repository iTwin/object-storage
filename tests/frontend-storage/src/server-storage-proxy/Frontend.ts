/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { TransferConfig } from "@itwin/object-storage-core";
import axios from "axios";
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
      .then(response => { return response.data; } )
  }

  public async download(request: Common.DownloadRequest): Promise<ArrayBuffer> {
    return this.post<ArrayBuffer>(Common.DownloadRequestPath, request);
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
    return this.post<boolean>(Common.BaseDirectoryExistsRequestPath, request);
  }

  public async objectExists(request: Common.ObjectExistsRequest): Promise<boolean> {
    return this.post<boolean>(Common.ObjectExistsRequestPath, request);
  }

  public async GetDownloadUrl(request: Common.GetDownloadUrlRequest): Promise<string> {
    return this.post<string>(Common.GetDownloadUrlRequestPath, request);
  }

  public async GetUploadUrl(request: Common.GetUploadUrlRequest): Promise<string> {
    return this.post<string>(Common.GetUploadUrlRequestPath, request);
  }

  public async GetDownloadConfig(request: Common.GetDownloadConfigRequest): Promise<TransferConfig> {
    return this.post<TransferConfig>(Common.GetDownloadConfigRequestPath, request);
  }

  public async GetUploadConfig(request: Common.GetUploadConfigRequest): Promise<TransferConfig> {
    return this.post<TransferConfig>(Common.GetUploadConfigRequestPath, request);
  }
}