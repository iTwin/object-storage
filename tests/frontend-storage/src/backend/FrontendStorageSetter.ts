/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Bindable, DependenciesConfig, Types as DependencyTypes } from "@itwin/cloud-agnostic-core";
import { FrontendStorageDependency, FrontendStorage } from "@itwin/object-storage-core/lib/frontend";
import { Container } from "inversify";

export class FrontendStorageSetter extends Bindable {
  public readonly container = new Container();

  constructor(
    config: DependenciesConfig,
    frontendStorageDependency: new () => FrontendStorageDependency
  ) {
    super();

    this.requireDependency(FrontendStorageDependency.dependencyType);
    this.useBindings(frontendStorageDependency);

    this.container
      .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
      .toConstantValue(config);
  }

  public async setStorageOnWindow(): Promise<void> {
    this.bindDependencies(this.container);

    const frontendStorage = this.container.get(FrontendStorage);
    (window as any).frontendStorage = frontendStorage;
  }
}