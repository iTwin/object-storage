/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  Bindable,
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import {
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import { setOptionsForInternalTests } from "./test/Config";

export class InternalStorageIntegrationTests extends Bindable {
  public readonly container = new Container();

  constructor(
    config: DependenciesConfig,
    serverStorageDependency: new () => ServerStorageDependency
  ) {
    super();

    this.setupDependencies(config, serverStorageDependency);
  }

  private setupDependencies(
    config: DependenciesConfig,
    serverStorageDependency: new () => ServerStorageDependency
  ): void {
    this.requireDependency(ServerStorageDependency.dependencyType);
    this.useBindings(serverStorageDependency);

    this.container
      .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
      .toConstantValue(config);

    this.bindDependencies(this.container);
    const serverStorage = this.container.getNamed(ServerStorage, "primary");

    setOptionsForInternalTests({
      serverStorage,
    });
  }

  public get serverStorage(): ServerStorage {
    return this.container.getNamed(ServerStorage, "primary");
  }
}
