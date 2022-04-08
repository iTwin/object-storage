/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { readdirSync } from "fs";
import { join } from "path";

import { Container } from "inversify";
import * as Mocha from "mocha";

import {
  Bindable,
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
  ServerStorage,
  ServerStorageDependency,
} from "@itwin/object-storage-core";

import { setOptions } from "./test/Config";

class StoragePair extends Bindable {
  public readonly container = new Container();

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

    this.container
      .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
      .toConstantValue(config);

    this.bindDependencies(this.container);
  }

  public get server() {
    return this.container.get(ServerStorage);
  }

  public get client() {
    return this.container.get(ClientStorage);
  }
}

export class StorageIntegrationTests {
  private readonly _nodePair: StoragePair;
  private readonly _browserPair: StoragePair;

  constructor(
    config: DependenciesConfig,
    serverStorageDependency: new () => ServerStorageDependency,
    clientStorageDependency: new () => ClientStorageDependency,
    frontendStorageDependency: new () => ClientStorageDependency
  ) {
    this._nodePair = new StoragePair(
      config,
      serverStorageDependency,
      clientStorageDependency
    );
    this._browserPair = new StoragePair(
      config,
      serverStorageDependency,
      frontendStorageDependency
    );
  }

  public async start(): Promise<void> {
    const serverStorage = this._nodePair.server;
    const clientStorage = this._nodePair.client;
    const frontendStorage = this._browserPair.client;

    setOptions({
      serverStorage,
      clientStorage,
      frontendStorage,
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
        serverStorage.releaseResources();
        resolve();
      })
    );
  }
}
