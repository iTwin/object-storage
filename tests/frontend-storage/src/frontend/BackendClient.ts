/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { RestClient } from "./RestClient";

interface GetTestDownloadUrlRequestBody {
  filePayload: string;
}

interface GetTestDownloadUrlResponseBody {
  downloadUrl: string;
}

export class BackendClient {
  private readonly _headers = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Type": "application/json",
  };

  public readonly entrypoint: string;

  constructor(
    private readonly _serverBaseUrl: string,
    private readonly _restClient: RestClient
  ) {
    this.entrypoint = `${this._serverBaseUrl}/index.html`;
  }

  public async getTestDownloadUrl(filePayload: string): Promise<string> {
    const url = `${this._serverBaseUrl}/download-url`;
    const body: GetTestDownloadUrlRequestBody = { filePayload };
    const response =
      await this._restClient.sendPostRequest<GetTestDownloadUrlResponseBody>({
        url,
        body,
        headers: this._headers,
      });
    return response.downloadUrl;
  }

  public async cleanup(): Promise<void> {
    const url = `${this._serverBaseUrl}/cleanup`;
    await this._restClient.sendPostRequest<void>({
      url,
      body: {},
      headers: this._headers,
    });
  }
}
