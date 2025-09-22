/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Readable } from "stream";

import {
  ConfigTransferInput,
  GenericAbortSignal,
  Metadata,
  MultipartUploadOptions,
  ObjectReference,
  TransferConfig,
  UrlTransferInput,
} from "../common";

export type TransferType = "buffer" | "stream" | "local";
export type TransferData = Readable | Buffer | string;
export type MultipartUploadData = Readable | string;

export interface UrlDownloadInput extends UrlTransferInput {
  transferType: TransferType;
  localPath?: string;
  abortSignal?: GenericAbortSignal;
}

export interface UrlUploadInput extends UrlTransferInput {
  data: TransferData;
  metadata?: Metadata;
}

export interface ConfigDownloadInput extends ConfigTransferInput {
  transferType: TransferType;
  localPath?: string;
  abortSignal?: GenericAbortSignal;
}

export interface ConfigUploadInput extends ConfigTransferInput {
  data: TransferData;
  metadata?: Metadata;
}

export interface UploadInMultiplePartsInput {
  data: MultipartUploadData;
  reference: ObjectReference;
  transferConfig: TransferConfig;
  options?: MultipartUploadOptions;
}

/** Abstraction for a single entity page returned by the API. */
export interface EntityCollectionPage<TEntity> {
  /** Current page entities. */
  entities: TEntity[];
  /** Function to retrieve the next page of the entities. If `undefined` the current page is last. */
  next?: () => Promise<EntityCollectionPage<TEntity>>;
}

/** Function to query an entity page. */
export type EntityPageQueryFunc<TEntity> = () => Promise<
  EntityCollectionPage<TEntity>
>;

export class EntityPageListIterator<TEntity>
  implements AsyncIterableIterator<TEntity[]>
{
  private _entityPages: AsyncIterableIterator<TEntity[]>;

  constructor(pageQueryFunc: EntityPageQueryFunc<TEntity>) {
    this._entityPages = this.queryPages(pageQueryFunc);
  }

  public [Symbol.asyncIterator](): AsyncIterableIterator<TEntity[]> {
    return this;
  }

  public async next(): Promise<IteratorResult<TEntity[]>> {
    return this._entityPages.next();
  }

  private async *queryPages(
    pageQueryFunc: EntityPageQueryFunc<TEntity>
  ): AsyncIterableIterator<TEntity[]> {
    let nextPageQueryFunc: EntityPageQueryFunc<TEntity> | undefined =
      pageQueryFunc;

    while (nextPageQueryFunc) {
      const entityPage: EntityCollectionPage<TEntity> =
        await nextPageQueryFunc();
      nextPageQueryFunc = entityPage.next;
      yield entityPage.entities;
    }
  }
}
export type ExpiryOptions =
  | {
      expiresInSeconds?: never;
      expiresOn?: Date;
    }
  | {
      expiresOn?: never;
      expiresInSeconds?: number;
    };

export interface CopyOptions {
  maxPageSize: number;
  maxConcurrency: number;
  continueOnError: boolean;
}
