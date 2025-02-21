/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { InversifyWrapper } from "@itwin/cloud-agnostic-core/lib/inversify";
import {
  FrontendStorage,
  FrontendStorageDependency,
  Types as CoreTypes,
} from "@itwin/object-storage-core/lib/frontend";

import {
  Bindable,
  DependenciesConfig,
  Types as DependencyTypes,
  DIContainer,
} from "@itwin/cloud-agnostic-core";

export class FrontendStorageTestSetup extends Bindable {
  public readonly container: DIContainer = InversifyWrapper.create();

  constructor(
    config: DependenciesConfig,
    frontendStorageDependency: new () => FrontendStorageDependency,
    private readonly _serverBaseUrl: string,
    private readonly _storageType: string
  ) {
    super();

    this.requireDependency(FrontendStorageDependency.dependencyType);
    this.useBindings(frontendStorageDependency);

    this.container.registerInstance<DependenciesConfig>(
      DependencyTypes.dependenciesConfig,
      config
    );
  }

  public setGlobals(): void {
    this.bindDependencies(this.container);
    const frontendStorage = this.container.resolve<FrontendStorage>(
      CoreTypes.Frontend.frontendStorage
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).frontendStorage = frontendStorage;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).serverBaseUrl = this._serverBaseUrl;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).storageType = this._storageType;
  }
}
