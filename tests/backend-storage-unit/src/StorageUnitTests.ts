/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { readdirSync } from "fs";
import { join } from "path";

import * as Mocha from "mocha";

import { InversifyWrapper } from "@itwin/cloud-agnostic-core/lib/inversify";

import {
  Bindable,
  Types as CoreTypes,
  DependenciesConfig,
  DIContainer,
} from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import { setOptions } from "./test/Config";

export class StorageUnitTests extends Bindable {
  public readonly container: DIContainer = InversifyWrapper.create();

  constructor(
    config: DependenciesConfig,
    serverStorageDependency: new () => ServerStorageDependency,
    clientStorageDependency: new () => ClientStorageDependency
  ) {
    super();

    this.requireDependency(ServerStorageDependency.dependencyType);
    this.requireDependency(ClientStorageDependency.dependencyType);

    this.useBindings(serverStorageDependency);
    this.useBindings(clientStorageDependency);

    this.container.registerInstance<DependenciesConfig>(
      CoreTypes.dependenciesConfig,
      config
    );
  }

  public async start(): Promise<void> {
    this.bindDependencies(this.container);

    const serverStorage = this.container.resolve(ServerStorage);
    const clientStorage = this.container.resolve(ClientStorage);

    setOptions({
      serverStorage,
      clientStorage,
    });

    const mochaOptions: Mocha.MochaOptions = {
      timeout: 999999,
      color: true,
      reporterOptions: {
        mochaFile: "lib/test/junit_results.xml",
      },
    };

    const mocha = new Mocha(mochaOptions);
    const testDirectory = join(__dirname, "test");

    readdirSync(testDirectory)
      .filter((file) => file.toLowerCase().endsWith("test.js"))
      .forEach((file) => mocha.addFile(join(testDirectory, file)));

    return new Promise<void>((resolve) =>
      mocha.run((failures: number) => {
        process.exitCode = failures ? 1 : 0;
        // serverStorage.releaseResources();
        resolve();
      })
    );
  }
}
