/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  Bindable,
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import { AzureServerStorageBindings } from "@itwin/object-storage-azure";
import { ServerStorage, ServerStorageDependency } from "@itwin/object-storage-core";
import { Container, inject, injectable, named } from "inversify";

@injectable()
export class DependsOnTwoStorages {
  constructor(
    @inject(ServerStorage) @named("instance1") private _storage1: ServerStorage,
    @inject(ServerStorage) @named("instance2") private _storage2: ServerStorage
  ) { }

  public log(): void {
    console.log((this._storage1 as any)._config.accountName);
    console.log();
    console.log();
    console.log((this._storage2 as any)._config.accountName);
  }
}

export class TestApp extends Bindable {
  public async run(): Promise<void> {
    const container = new Container();

    this.requireDependency(ServerStorageDependency.dependencyType);
    container
      .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
      .toConstantValue({
        ServerStorage: [
          {
            instanceName: "instance1",
            dependencyName: "azure",
            accountName: "instance1storage",
            accountKey: "someKey",
            baseUrl: "https://instance1storage.blob.core.windows.net"
          },
          {
            instanceName: "instance2",
            dependencyName: "azure",
            accountName: "instance2storage",
            accountKey: "someKey",
            baseUrl: "https://instance2storage.blob.core.windows.net"
          }
        ]
      } as any);
    this.useBindings(AzureServerStorageBindings);
    this.bindDependencies(container);
    container.bind(DependsOnTwoStorages).toSelf().inSingletonScope();

    const instance = container.get(DependsOnTwoStorages);
    //  prints
    //  instance1storage
    //  instance2storage
    instance.log();
  }
}

new TestApp().run();

