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

import { setOptions } from "./Config";

export class StorageIntegrationTests extends Bindable {
  public readonly container = new Container();

  constructor(
    config: DependenciesConfig,
    serverStorageDependency: new () => ServerStorageDependency,
    clientStorageDependency: new () => ClientStorageDependency,
    private readonly _mochaGrepPattern?: string
  ) {
    super();

    this.requireDependency(ServerStorageDependency.dependencyType);
    this.requireDependency(ClientStorageDependency.dependencyType);

    this.useBindings(serverStorageDependency);
    this.useBindings(clientStorageDependency);

    this.container
      .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
      .toConstantValue(config);
  }

  public async start(): Promise<void> {
    this.bindDependencies(this.container);

    const serverStorage = this.container.getNamed(ServerStorage, "primary");
    const serverStorage2 = this.container.getNamed(ServerStorage, "secondary");
    const clientStorage = this.container.get(ClientStorage);

    setOptions({
      serverStorage,
      serverStorage2,
      clientStorage,
    });

    const mochaOptions: Mocha.MochaOptions = {
      timeout: 999999,
      color: true,
      grep: this._mochaGrepPattern,
      reporterOptions: {
        mochaFile: "lib/test/junit_results.xml",
      },
    };

    const mocha = new Mocha(mochaOptions);
    const testDirectory = __dirname;

    readdirSync(testDirectory)
      .filter((file) => file.toLowerCase().endsWith("test.js"))
      .forEach((file) => mocha.addFile(join(testDirectory, file)));

    return new Promise<void>((resolve, reject) =>
      mocha.run((failures: number) => {
        process.exitCode = failures ? 1 : 0;
        serverStorage.releaseResources().catch((error) => reject(error));
        resolve();
      })
    );
  }
}
