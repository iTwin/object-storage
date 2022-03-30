/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { Container, injectable } from "inversify";

import {
  Bindable,
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import { AzureClientStorageBindings } from "@itwin/object-storage-azure";
import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core";

/**
 * Simple file downloader that depends on {@link ClientStorage}. Any specific
 * implementation of {@link ClientStorage} can be passed to the constructor
 * making this class cloud agnostic.
 */
@injectable()
export class FileDownloader {
  constructor(private _storage: ClientStorage) {}

  /**
   * This method downloads a file using a signed file url. Replace the url
   * placeholder text with an actual url to Azure file in Blob Storage.
   */
  public async downloadFile(): Promise<void> {
    await this._storage.download({
      transferType: "local",
      url: "FILE_URL_PLACEHOLDER",
      localPath: "downloadedFile.txt",
    });
  }
}

/**
 * This minimal application demonstrates how storage components can be
 * configured using the provided `inversify` container configuration utilities.
 * This application uses `ClientStorage` to download a specific file and is
 * configured so that `ClientStorage` would resolve to `AzureClientStorage`
 * (see {@link AzureClientStorageBindings}).
 */
export class App extends Bindable {
  public readonly container = new Container();

  /**
   * In the constructor we define what dependencies the application requires.
   * We also bind the {@link DependenciesConfig} here since it is a constant
   * value but applications could delay this step until startup as long as it is
   * configured before calling {@link Bindable.bindDependencies}.
   */
  constructor() {
    super();

    this.requireDependency(ClientStorageDependency.dependencyType);
    this.useBindings(AzureClientStorageBindings);
    this.container
      .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
      .toConstantValue(this.getDependenciesConfig());

    this.container.bind(FileDownloader).toSelf().inSingletonScope();
  }

  /**
   * In the application startup we bind the registered dependencies
   * to their implementations and use the configured {@link FileDownloader}`.
   * */
  public async start(): Promise<void> {
    this.bindDependencies(this.container);

    const fileDownloader = this.container.get(FileDownloader);
    await fileDownloader.downloadFile();
  }

  private getDependenciesConfig(): DependenciesConfig {
    return {
      ClientStorage: {
        dependencyName: "azure",
      },
    };
  }
}

const app = new App();
app.start().catch((err) => console.error(err));
