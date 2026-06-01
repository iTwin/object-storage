/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import axios, { AxiosError } from "axios";

import { RetryOptions } from "../../common";
import {
  FrontendTransferData,
  FrontendUrlDownloadInput,
} from "../FrontendInterfaces";

export class FrontendUrlTransferClient {
  public constructor(private readonly _retryOptions: RetryOptions = {}) {}

  public async download(
    input: FrontendUrlDownloadInput,
    headers?: Record<string, string>
  ): Promise<FrontendTransferData> {
    const { transferType, url } = input;

    switch (transferType) {
      case "buffer":
        return this.withRetry(() =>
          FrontendUrlTransferClient.downloadAsBuffer(url, headers)
        );
      case "stream":
        return this.withRetry(() =>
          FrontendUrlTransferClient.downloadAsStream(url, headers)
        );
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Type ${transferType} is not supported`);
    }
  }

  public async upload(
    url: string,
    data: FrontendTransferData,
    method: "POST" | "PUT",
    headers?: Record<string, string>
  ): Promise<void> {
    if (data instanceof ReadableStream) {
      // Streams cannot be retried as they are consumed on first read
      await FrontendUrlTransferClient.putData(url, data, method, headers);
      return;
    }

    await this.withRetry(() =>
      FrontendUrlTransferClient.putData(url, data, method, headers)
    );
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = this._retryOptions?.maxRetries ?? 3;
    const retryDelayMs = this._retryOptions?.retryDelayMs ?? 1000;
    const maxRetryDelayMs = this._retryOptions?.maxRetryDelayMs ?? 30000;

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (!FrontendUrlTransferClient.isRetryableAxiosError(error))
          throw error;

        // If throwing from here for max retries, it breaks typescript type inference
        lastError = error;
        if (attempt >= maxRetries) break;

        const delay = Math.min(
          retryDelayMs * Math.pow(2, attempt),
          maxRetryDelayMs
        );
        await FrontendUrlTransferClient.sleep(delay);
      }
    }

    throw lastError;
  }

  private static async downloadAsBuffer(
    url: string,
    headers?: Record<string, string>
  ): Promise<ArrayBuffer> {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers,
    });
    return response.data as ArrayBuffer;
  }

  private static async downloadAsStream(
    url: string,
    headers?: Record<string, string>
  ): Promise<ReadableStream> {
    const response = await axios.get(url, {
      responseType: "blob",
      headers,
    });
    return (response.data as Blob).stream();
  }

  private static async putData(
    url: string,
    data: FrontendTransferData,
    method: "POST" | "PUT",
    headers?: Record<string, string>
  ): Promise<void> {
    await axios.request({
      url,
      method,
      data,
      headers,
    });
  }

  private static isRetryableAxiosError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;

    const axiosError = error as AxiosError;
    if (!axiosError.response) {
      // Network error or timeout
      return true;
    }

    const status = axiosError.response.status;
    return status === 429 || status >= 500;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
