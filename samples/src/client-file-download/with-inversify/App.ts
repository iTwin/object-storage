/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Bindable } from "@itwin/cloud-agnostic-core";
import { ClientStorageDependency } from "@itwin/object-storage-core";

import { FileDownloader } from "../FileDownloader";

/**
 * This class is an example of a minimal application that depends on generic
 * `ClientStorage` class. It is not aware of any implementations which are
 * configured at runtime (see Run.ts file in this directory). It manages its
 * components using a container provided by `inversify`.
 */
export class App extends Bindable {
  public container = new Container();

  /**
   * The app constructor defines that it requires `ClientStorage` dependency
   * and relies on its startup to append container configuration by binding a
   * specific `ClientStorage` implementation.
   */
  constructor() {
    super();
    this.requireDependency(ClientStorageDependency.dependencyType);
    this.container.bind(FileDownloader).toSelf().inSingletonScope();
  }

  /**
   * `bindDependencies` executes all bindings registered by the `App.start`
   * caller. The caller uses `Bindable.useBindings` method to register specific
   * implementations for required dependencies (see Run.ts file in this
   * directory). Delaying the actual binding execution until right before using
   * the container to retrieve class instances allows the `App` class to rely on
   * its caller to register bindings between constructing an instance of `App`
   * and starting it.
   */
  public async start(): Promise<void> {
    this.bindDependencies(this.container);

    const fileDownloader = this.container.get(FileDownloader);
    await fileDownloader.downloadFile();
  }
}
