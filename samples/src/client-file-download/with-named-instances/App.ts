/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { InversifyWrapper } from "@itwin/cloud-agnostic-core/lib/inversify";

import { Bindable, DIContainer } from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
} from "@itwin/object-storage-core";

import { NamedFileDownloader } from "../NamedFileDownloader";

/**
 * This class is an example of a minimal application that depends on generic
 * `ClientStorage` class. It is not aware of any implementations of
 * `ClientStorage` which are configured at runtime. The caller uses
 * `Bindable.useBindings` method to register specific implementations for
 * required dependencies (see Run.ts file in this directory).
 */
export class App extends Bindable {
  public container: DIContainer = InversifyWrapper.create();

  /**
   * The app constructor defines that it requires `ClientStorage` dependency
   * and relies on its startup to append container configuration by binding a
   * specific `ClientStorage` implementation.
   */
  constructor() {
    super();
    this.requireDependency(ClientStorageDependency.dependencyType);
    this.container.registerFactory(NamedFileDownloader, (c: DIContainer) => {
      return new NamedFileDownloader(
        c.resolveNamed<ClientStorage>(ClientStorage, "instanceName1"),
        c.resolveNamed<ClientStorage>(ClientStorage, "instanceName2")
      );
    });
  }

  /**
   * For every dependency registered in `App` constructor, `bindDependencies`
   * selects one set of bindings based on config and adds it to the dependency
   * injection container. Delaying this `bindDependencies` call until the start
   * method allows us to rebind config to a different value and to register
   * additional implementations that `App` does not have access to.
   */
  public async start(): Promise<void> {
    this.bindDependencies(this.container);

    const namedFileDownloader = this.container.resolve(NamedFileDownloader);
    await namedFileDownloader.downloadAllFiles();
  }
}
