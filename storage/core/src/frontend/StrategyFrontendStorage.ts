/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { StrategyInstance } from "@itwin/cloud-agnostic-core";

import {
  ConfigTransferInput,
  inputToStorageType,
  UrlTransferInput,
} from "../common";

import {
  FrontendConfigDownloadInput,
  FrontendConfigUploadInput,
  FrontendUploadInMultiplePartsInput,
  FrontendUrlDownloadInput,
  FrontendUrlUploadInput,
} from "./FrontendInterfaces";
import { FrontendStorage } from "./FrontendStorage";

export class StrategyFrontendStorage extends FrontendStorage {
  private _clients = new Map<string, FrontendStorage>();
  public constructor(clients: StrategyInstance<FrontendStorage>[]) {
    super();
    for (const client of clients) {
      this._clients.set(client.instanceName, client.instance);
    }
  }

  private getClient(
    input: UrlTransferInput | ConfigTransferInput
  ): FrontendStorage {
    const storageType = inputToStorageType(input);
    const client = this._clients.get(storageType);
    if (client === undefined) {
      throw new Error(`Client for storage type ${storageType} not found`);
    }
    return client;
  }

  public download(
    input: (FrontendUrlDownloadInput | FrontendConfigDownloadInput) & {
      transferType: "buffer";
    }
  ): Promise<ArrayBuffer>;

  public download(
    input: (FrontendUrlDownloadInput | FrontendConfigDownloadInput) & {
      transferType: "stream";
    }
  ): Promise<ReadableStream>;

  public download(
    input: FrontendUrlDownloadInput | FrontendConfigDownloadInput
  ): Promise<ArrayBuffer | ReadableStream> {
    if (input.transferType === "buffer") {
      return this.getClient(input).download(
        input as (FrontendUrlDownloadInput | FrontendConfigDownloadInput) & {
          transferType: "buffer";
        }
      );
    }

    return this.getClient(input).download(
      input as (FrontendUrlDownloadInput | FrontendConfigDownloadInput) & {
        transferType: "stream";
      }
    );
  }

  public upload(
    input: FrontendUrlUploadInput | FrontendConfigUploadInput
  ): Promise<void> {
    return this.getClient(input).upload(input);
  }

  public uploadInMultipleParts(
    input: FrontendUploadInMultiplePartsInput
  ): Promise<void> {
    return this.getClient(input).uploadInMultipleParts(input);
  }
}
