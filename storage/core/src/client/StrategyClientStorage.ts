/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Readable } from "stream";

import { StrategyInstance } from "@itwin/cloud-agnostic-core";

import {
  ConfigTransferInput,
  inputToStorageType,
  UrlTransferInput,
} from "../common";
import {
  ConfigDownloadInput,
  ConfigUploadInput,
  TransferData,
  UploadInMultiplePartsInput,
  UrlDownloadInput,
  UrlUploadInput,
} from "../server";

import { ClientStorage } from "./ClientStorage";

export class StrategyClientStorage extends ClientStorage {
  private _clients = new Map<string, ClientStorage>();
  public constructor(clients: StrategyInstance<ClientStorage>[]) {
    super();
    for (const client of clients) {
      this._clients.set(client.instanceName, client.instance);
    }
  }

  private getClient(
    input: UrlTransferInput | ConfigTransferInput
  ): ClientStorage {
    const storageType = inputToStorageType(input);
    const client = this._clients.get(storageType);
    if (client === undefined) {
      throw new Error(`Client for storage type ${storageType} not found`);
    }
    return client;
  }

  public override download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "buffer" }
  ): Promise<Buffer>;

  public override download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "stream" }
  ): Promise<Readable>;

  public override download(
    input: (UrlDownloadInput | ConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;

  public download(
    input: UrlDownloadInput | ConfigDownloadInput
  ): Promise<TransferData> {
    if (input.transferType === "buffer") {
      return this.getClient(input).download(
        input as (UrlDownloadInput | ConfigDownloadInput) & {
          transferType: "buffer";
        }
      );
    } else if (input.transferType === "stream") {
      return this.getClient(input).download(
        input as (UrlDownloadInput | ConfigDownloadInput) & {
          transferType: "stream";
        }
      );
    }
    return this.getClient(input).download(
      input as (UrlDownloadInput | ConfigDownloadInput) & {
        transferType: "local";
        localPath: string;
      }
    );
  }

  public override upload(
    input: UrlUploadInput | ConfigUploadInput
  ): Promise<void> {
    return this.getClient(input).upload(input);
  }

  public override uploadInMultipleParts(
    input: UploadInMultiplePartsInput
  ): Promise<void> {
    return this.getClient(input).uploadInMultipleParts(input);
  }
}
