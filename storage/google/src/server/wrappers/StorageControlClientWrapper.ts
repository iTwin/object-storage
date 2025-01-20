/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { StorageControlClient } from "@google-cloud/storage-control";
import { DownscopedClient, GoogleAuth } from "google-auth-library";

import {
  BaseDirectory,
  EntityCollectionPage,
} from "@itwin/object-storage-core";

import { Constants, GoogleTransferConfig } from "../../common";

import { GoogleStorageConfig } from "./GoogleStorageConfig";
import { GoogleStorageConfigType, roleFromConfigType } from "./Helpers";

export interface GoogleError extends Error {
  code: number;
}

export function isGoogleError(error: unknown): error is GoogleError {
  return error instanceof Error && (error as GoogleError).code !== undefined;
}

export class StorageControlClientWrapper {
  private readonly _client: StorageControlClient;
  constructor(private readonly _config: GoogleStorageConfig) {
    this._client = new StorageControlClient({
      projectId: this._config.projectId,
    });
  }

  public async createManagedFolder(folderName: string): Promise<void> {
    const parent = this.bucketPath;
    await this._client.createManagedFolder({
      parent,
      managedFolderId: folderName,
    });
  }

  public async deleteManagedFolder(folderName: string): Promise<void> {
    const managedFolder = this.managedFolderPath(folderName);
    try {
      await this._client.deleteManagedFolder({
        name: managedFolder,
      });
    } catch (error) {
      if (isGoogleError(error) && error.code != 5) {
        throw error;
      }
    }
  }

  public async getManagedFoldersNextPage(options: {
    maxPageSize: number;
    continuationToken?: string;
  }): Promise<EntityCollectionPage<BaseDirectory>> {
    const parent = this.bucketPath;
    const [folders, _, response] = await this._client.listManagedFolders(
      {
        parent,
        pageSize: options.maxPageSize,
        pageToken: options.continuationToken,
      },
      { autoPaginate: false }
    );
    const directories: BaseDirectory[] =
      folders.map((entry) => {
        return {
          baseDirectory: entry.name?.split("/").slice(5, -1).join("/"),
        } as BaseDirectory;
      }) ?? [];
    const continuationToken = response?.nextPageToken;
    const page: EntityCollectionPage<BaseDirectory> = {
      entities: directories,
      next: !continuationToken
        ? undefined
        : () =>
            this.getManagedFoldersNextPage({
              maxPageSize: options.maxPageSize,
              continuationToken: continuationToken,
            }),
    };
    return page;
  }

  public async getManagedFolders(): Promise<BaseDirectory[]> {
    const parent = this._client.bucketPath("_", this._config.bucketName);
    const [folders, _1, _2] = await this._client.listManagedFolders({
      parent,
    });
    const directories: BaseDirectory[] =
      folders.map(
        (entry) => ({ baseDirectory: entry.name } as BaseDirectory)
      ) ?? [];
    return directories;
  }

  public async managedFolderExists(folderName: string): Promise<boolean> {
    const managedFolder = this.managedFolderPath(folderName);
    try {
      await this._client.getManagedFolder({
        name: managedFolder,
      });
      return true;
    } catch (error) {
      if (isGoogleError(error) && error.code == 5) {
        return false;
      }
      throw error;
    }
  }

  public async createAccessToken(
    action: GoogleStorageConfigType,
    folderName: string
  ): Promise<GoogleTransferConfig> {
    const cab = {
      accessBoundary: {
        accessBoundaryRules: [
          {
            availableResource: this.bucketUri,
            availablePermissions: [roleFromConfigType(action)],
            availabilityCondition: {
              expression:
                `resource.name.startsWith('${this.bucketPath}/objects/${folderName}') || ` +
                `api.getAttribute('storage.googleapis.com/objectListPrefix', '')` +
                `.startsWith('${folderName}/')`,
            },
          },
        ],
      },
    };
    const googleAuth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/cloud-platform",
      projectId: this._config.projectId,
    });
    const client = await googleAuth.getClient();
    const downscopedClient = new DownscopedClient(client, cab);
    const { token, expirationTime } = await downscopedClient.getAccessToken();
    return {
      baseUrl: this.bucketUri,
      authentication: `Bearer ${token!}`,
      expiration: new Date(expirationTime!),
      bucketName: this._config.bucketName,
      storageType: Constants.storageType,
    };
  }

  private managedFolderPath(folderName: string): string {
    return this._client.managedFolderPath(
      "_",
      this._config.bucketName,
      folderName
    );
  }

  private get bucketPath(): string {
    return this._client.bucketPath("_", this._config.bucketName);
  }

  private get bucketUri(): string {
    return `//storage.googleapis.com/${this.bucketPath}`;
  }

  public async releaseResources(): Promise<void> {
    await this._client.close();
  }
}
