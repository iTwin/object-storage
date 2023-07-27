/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import { injectable } from "inversify";

import {
  ConfigTransferInput,
  DirectoryTransferConfigInput,
  EntityPageListIterator,
  ObjectReference,
} from "../common";
import {
  ConfigDownloadInput,
  ConfigUploadInput,
  UploadInMultiplePartsInput,
  UrlDownloadInput,
  UrlUploadInput,
} from "../server";

@injectable()
export abstract class ClientStorage {
  public abstract download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "buffer" }
  ): Promise<Buffer>;

  public abstract download(
    input: (UrlDownloadInput | ConfigDownloadInput) & { transferType: "stream" }
  ): Promise<Readable>;

  public abstract download(
    input: (UrlDownloadInput | ConfigDownloadInput) & {
      transferType: "local";
      localPath: string;
    }
  ): Promise<string>;

  public abstract upload(
    input: UrlUploadInput | ConfigUploadInput
  ): Promise<void>;

  public abstract uploadInMultipleParts(
    input: UploadInMultiplePartsInput
  ): Promise<void>;

  public abstract deleteObject(input: ConfigTransferInput): Promise<void>;

  public async listObjects(
    input: DirectoryTransferConfigInput
  ): Promise<ObjectReference[]> {
    const maxPageSize = 1000;
    const objectsIterator = this.getListObjectsPagedIterator(
      input,
      maxPageSize
    );
    return await this.listAllEntriesFromIterator(objectsIterator);
  }

  public abstract getListObjectsPagedIterator(
    input: DirectoryTransferConfigInput,
    maxPageSize: number
  ): EntityPageListIterator<ObjectReference>;

  protected async listAllEntriesFromIterator<TEntry>(
    pageIterator: EntityPageListIterator<TEntry>
  ): Promise<TEntry[]> {
    let allEntries: TEntry[] = [];
    for await (const entityPage of pageIterator)
      allEntries = [...allEntries, ...entityPage];
    return allEntries;
  }
}
