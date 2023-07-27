/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
export interface Metadata {
  [key: string]: string;
}

export interface MultipartUploadOptions {
  partSize?: number;
  queueSize?: number;
  metadata?: Metadata;
}

export interface BaseDirectory {
  /** Container for Azure. First directory of a prefix for S3. */
  baseDirectory: string;
}

export interface ObjectDirectory extends BaseDirectory {
  /** Additional directories in the path to object. */
  relativeDirectory?: string;
}

export interface ObjectReference extends ObjectDirectory {
  objectName: string;
}

export interface ContentHeaders {
  contentEncoding?: string;
  cacheControl?: string;
  contentType?: string;
}

export type ObjectProperties = ContentHeaders & {
  reference: ObjectReference;
  size: number;
  lastModified: Date;
  metadata?: Metadata;
};

export interface TransferConfig {
  baseUrl: string;
  expiration: Date;
}

export interface UrlTransferInput {
  url: string;
}

export interface ConfigTransferInput {
  reference: ObjectReference;
  transferConfig: TransferConfig;
}

export interface DirectoryTransferConfigInput {
  baseDirectory: BaseDirectory;
  transferConfig: TransferConfig;
}

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
