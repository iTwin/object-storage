/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Constants } from "../backend/Constants";

import { RestClient } from "./RestClient";

interface GetTestDownloadUrlRequestBody {
  filePayload: string;
}

interface GetTestDownloadUrlResponseBody {
  downloadUrl: string;
}

export class BackendClient {
  private readonly _baseUrl = `http://localhost:${Constants.port}`;
  private readonly _headers = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Type": "application/json",
  };

  public readonly entrypoint = `${this._baseUrl}/index.html`;

  constructor(private _restClient: RestClient) { }

  public async getTestDownloadUrl(filePayload: string): Promise<string> {
    const url = `${this._baseUrl}/download-url`;
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
    const url = `${this._baseUrl}/cleanup`;
    await this._restClient.sendPostRequest<void>({
      url,
      body: {},
      headers: this._headers,
    });
  }
}
