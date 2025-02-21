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
  DependenciesConfig,
  Types as DependencyTypes,
  DIContainer,
} from "@itwin/cloud-agnostic-core";
import {
  ClientStorage,
  ClientStorageDependency,
  ServerStorage,
  ServerStorageDependency,
  Types as CoreTypes,
} from "@itwin/object-storage-core";

import { setOptions } from "./Config";

export class StorageIntegrationTests extends Bindable {
  public readonly container: DIContainer = InversifyWrapper.create();

  constructor(
    config: DependenciesConfig,
    serverStorageDependency: new () => ServerStorageDependency,
    clientStorageDependency: new () => ClientStorageDependency,
    private _storageType: string,
    private readonly _mochaGrepPattern?: string
  ) {
    super();

    this.requireDependency(ServerStorageDependency.dependencyType);
    this.requireDependency(ClientStorageDependency.dependencyType);

    this.useBindings(serverStorageDependency);
    this.useBindings(clientStorageDependency);

    this.container.registerInstance<DependenciesConfig>(
      DependencyTypes.dependenciesConfig,
      config
    );
  }

  public async start(): Promise<void> {
    this.bindDependencies(this.container);

    const serverStorage = this.container.resolveNamed<ServerStorage>(
      CoreTypes.Server.serverStorage,
      "primary"
    );
    const serverStorage2 = this.container.resolveNamed<ServerStorage>(
      CoreTypes.Server.serverStorage,
      "secondary"
    );
    const clientStorage = this.container.resolve<ClientStorage>(
      CoreTypes.Client.clientStorage
    );

    setOptions({
      serverStorage,
      serverStorage2,
      clientStorage,
      storageType: this._storageType,
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
