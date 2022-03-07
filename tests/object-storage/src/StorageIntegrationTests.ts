/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { readdirSync } from "fs";
import { join } from "path";

import { Container } from "inversify";
import * as Mocha from "mocha";

import {
  Dependable,
  DependenciesConfig,
  Types as DependencyTypes,
} from "@itwin/cloud-agnostic-core";
import {
  ClientSideStorage,
  ClientSideStorageDependency,
  ServerSideStorage,
  ServerSideStorageDependency,
} from "@itwin/object-storage-core";

import { setOptions } from "./test/Config";

export class StorageIntegrationTests extends Dependable {
  public readonly container = new Container();

  constructor(
    config: DependenciesConfig,
    serverSideDependency: new () => ServerSideStorageDependency,
    clientSideDependency: new () => ClientSideStorageDependency
  ) {
    super();

    this.requireDependency(ServerSideStorageDependency.dependencyType);
    this.requireDependency(ClientSideStorageDependency.dependencyType);

    this.useDependency(serverSideDependency);
    this.useDependency(clientSideDependency);

    this.container
      .bind<DependenciesConfig>(DependencyTypes.dependenciesConfig)
      .toConstantValue(config);
  }

  public async start(): Promise<void> {
    this.registerDependencies(this.container);

    const serverSideStorage = this.container.get(ServerSideStorage);
    const clientSideStorage = this.container.get(ClientSideStorage);

    setOptions({
      serverSideStorage,
      clientSideStorage,
    });

    const mochaOptions: Mocha.MochaOptions = {
      timeout: 999999,
      reporter: "@bentley/build-tools/mocha-reporter",
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
        serverSideStorage.releaseResources();
        resolve();
      })
    );
  }
}
