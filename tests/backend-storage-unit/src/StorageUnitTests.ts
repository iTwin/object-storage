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
} from "@itwin/cloud-agnostic-core";
import {
  ClientStorage, ServerStorage,
} from "@itwin/object-storage-core";

import { setOptions } from "./test/Config";

export class StorageUnitTests extends Bindable {
  public readonly container = new Container();

  constructor(
    private _serverStorage: ServerStorage,
    private _clientStorage: ClientStorage,
  ) {
    super();
  }

  public async start(): Promise<void> {
    setOptions({
      serverStorage: this._serverStorage,
      clientStorage: this._clientStorage,
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
