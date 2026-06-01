/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { createReadStream } from "fs";
import { Readable } from "stream";

import axios from "axios";

import { createClientAbortSignal, RetryOptions } from "../../common";
import { TransferData, UrlDownloadInput } from "../Interfaces";

import {
  assertFileNotEmpty,
  assertLocalFile,
  streamToLocalFile,
} from "./Helpers";

export class UrlTransferClient {
  public constructor(private readonly _retryOptions: RetryOptions = {}) {}

  public async download(input: UrlDownloadInput): Promise<TransferData> {
    const { transferType, url, abortSignal } = input;

    const signal = abortSignal
      ? createClientAbortSignal(abortSignal)
      : undefined;

    switch (transferType) {
      case "buffer":
        return this.withRetry(
          () => UrlTransferClient.downloadAsBuffer(url, signal),
          signal
        );
      case "stream":
        return this.withRetry(
          () => UrlTransferClient.downloadAsStream(url, signal),
          signal
        );
      case "local": {
        const { localPath } = input;
        assertLocalFile(localPath);
        return this.withRetry(
          () => UrlTransferClient.downloadToLocalFile(url, localPath, signal),
          signal
        );
      }
      default:
        throw new Error(`Type ${input.transferType} is not supported`);
    }
  }

  public async upload(
    url: string,
    data: TransferData,
    headers?: Record<string, string>
  ): Promise<void> {
    if (data instanceof Readable) {
      // Streams cannot be retried as they are consumed on first read
      await UrlTransferClient.putData(url, data, headers);
      return;
    }
    await this.withRetry(async () => {
      if (typeof data === "string") await assertFileNotEmpty(data);
      const dataToUpload =
        typeof data === "string" ? createReadStream(data) : data;
      await UrlTransferClient.putData(url, dataToUpload, headers);
    });
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    signal?: AbortSignal
  ): Promise<T> {
    const maxRetries = this._retryOptions?.maxRetries ?? 3;
    const retryDelayMs = this._retryOptions?.retryDelayMs ?? 1000;
    const maxRetryDelayMs = this._retryOptions?.maxRetryDelayMs ?? 30000;

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (!UrlTransferClient.isRetryableAxiosError(error)) throw error;
        if (signal?.aborted) throw error;

        // If throwing from here for max retries, it breaks typescript type inference
        lastError = error;
        if (attempt >= maxRetries) break;

        const delay = Math.min(
          retryDelayMs * Math.pow(2, attempt),
          maxRetryDelayMs
        );
        await UrlTransferClient.abortableSleep(delay, signal);
      }
    }

    throw lastError;
  }

  private static abortableSleep(
    ms: number,
    signal?: AbortSignal
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }, ms);
      const onAbort = (): void => {
        clearTimeout(timer);
        const error = new Error("Aborted");
        error.name = "AbortError";
        reject(error);
      };
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  private static isRetryableAxiosError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;
    if (!error.response) return true; // network error / no response
    return error.response.status >= 500 || error.response.status === 429;
  }

  private static async putData(
    url: string,
    data: Readable | Buffer,
    headers?: Record<string, string>
  ): Promise<void> {
    await axios.put(url, data, { headers });
  }

  private static async downloadAsBuffer(
    url: string,
    signal?: AbortSignal
  ): Promise<Buffer> {
    let promise = axios.get<Buffer>(url, {
      responseType: "arraybuffer",
      signal,
    });
    promise = UrlTransferClient.convertAbortErrorName(promise);
    return (await promise).data;
  }

  private static async downloadAsStream(
    url: string,
    signal?: AbortSignal
  ): Promise<Readable> {
    let promise = axios.get<Readable>(url, {
      responseType: "stream",
      signal,
    });
    promise = UrlTransferClient.convertAbortErrorName(promise);
    return (await promise).data;
  }

  private static async downloadToLocalFile(
    url: string,
    localPath: string,
    signal?: AbortSignal
  ): Promise<string> {
    let promise = axios.get<Readable>(url, {
      responseType: "stream",
      signal,
    });
    promise = UrlTransferClient.convertAbortErrorName(promise);
    const stream = (await promise).data;
    await streamToLocalFile(stream, localPath);
    return localPath;
  }

  private static async convertAbortErrorName<T>(
    promise: Promise<T>
  ): Promise<T> {
    try {
      return await promise;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "CanceledError")
        error.name = "AbortError";
      throw error;
    }
  }
}
