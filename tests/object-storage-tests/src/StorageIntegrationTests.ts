/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { randomUUID } from "crypto";
import { readdirSync } from "fs";
import { join } from "path";

import { Container } from "inversify";
import * as Mocha from "mocha";

import {
  Extendable,
  ExtensionsConfig,
  Types as ExtensionTypes,
} from "@itwin/cloud-agnostic-core";
import {
  ClientSideStorage,
  ClientSideStorageExtension,
  ServerSideStorage,
  ServerSideStorageExtension,
} from "@itwin/object-storage-core";

import { setOptions } from "./test/Config";

export class StorageIntegrationTests extends Extendable {
  public readonly container = new Container();

  constructor(
    private readonly _config: ExtensionsConfig,
    serverSideExtension: new () => ServerSideStorageExtension,
    clientSideExtension: new () => ClientSideStorageExtension
  ) {
    super();

    this.requireExtension(ServerSideStorageExtension.extensionType);
    this.requireExtension(ClientSideStorageExtension.extensionType);

    this.useExtension(serverSideExtension);
    this.useExtension(clientSideExtension);

    this.container
      .bind<ExtensionsConfig>(ExtensionTypes.extensionsConfig)
      .toConstantValue(_config);
  }

  public start(): void {
    this.bindExtensions(this.container);

    const serverSideStorage = this.container.get(ServerSideStorage);
    const clientSideStorage = this.container.get(ClientSideStorage);

    setOptions({
      serverSideStorage,
      clientSideStorage,
      clientExtensionName: this._config.ServerSideStorage.extensionName,
      serverExtensionName: this._config.ClientSideStorage.extensionName,
      baseDirectory: randomUUID(),
      relativeDirectory: "foobar",
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

    mocha
      .run()
      .on("fail", () => {
        process.exitCode = 1;
      })
      .on("end", () => process.exit(0)); // process hangs after tests without this
  }
}
