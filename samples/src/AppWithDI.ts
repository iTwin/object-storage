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

@injectable()
export class FileDownloader {
  constructor(private _storage: ClientStorage) {}

  public async downloadFile(): Promise<void> {
    await this._storage.download({
      transferType: "local",
      url: "FILE_URL_PLACEHOLDER",
      localPath: "downloadedFile.txt",
    });
  }
}

export class App extends Bindable {
  public readonly container = new Container();

  constructor() {
    super();

    this.requireDependency(ClientStorageDependency.dependencyType);
    this.useBindings(AzureClientStorageBindings);
    this.container
      .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
      .toConstantValue(this.getDependenciesConfig());

    this.container.bind(FileDownloader).toSelf().inSingletonScope();
  }

  public async start(): Promise<void> {
    this.bindDependencies(this.container);

    const fileDownloader = this.container.get(FileDownloader);
    await fileDownloader.downloadFile();
  }

  private getDependenciesConfig(): DependenciesConfig {
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ClientStorage: {
        dependencyName: "azure",
      },
    };
  }
}

const app = new App();
// eslint-disable-next-line no-console
app.start().catch((err) => console.error(err));
