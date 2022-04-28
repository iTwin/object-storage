/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export interface HttpRequestWithBodyParams {
  url: string;
  headers: { [key: string]: string };
  body: unknown;
}

export class RestClient {
  public async sendPostRequest<TResponse>(
    params: HttpRequestWithBodyParams
  ): Promise<TResponse> {
    const requestConfig: AxiosRequestConfig = {
      headers: params.headers,
    };

    return axios
      .post(params.url, params.body ?? {}, requestConfig)
      .then((successResponse: AxiosResponse<TResponse>) =>
        this.handleSuccess(successResponse)
      )
      .catch((errorResponse: AxiosError<TResponse>) =>
        this.handleError(errorResponse)
      );
  }

  private handleError<TResponse>(errorResponse: AxiosError<TResponse>): never {
    throw new Error(
      `Status code: ${errorResponse.response?.status}, body: ${JSON.stringify(
        errorResponse.response?.data
      )}`
    );
  }

  private handleSuccess<TResponse>(
    response: AxiosResponse<TResponse>
  ): TResponse {
    return response.data;
  }
}
