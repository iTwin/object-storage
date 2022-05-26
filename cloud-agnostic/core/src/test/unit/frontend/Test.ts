/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { inject, injectable } from "inversify";

import { DependencyConfig } from "../../..";

export interface TestConfig extends DependencyConfig {
  testProperty: string;
}

export const testConfigType = Symbol.for("TestConfig");

@injectable()
export abstract class Test {
  abstract get property(): string;
}

@injectable()
export class ConcreteTest extends Test {
  constructor(
    @inject(testConfigType)
    private _config: TestConfig
  ) {
    super();
  }

  public get property(): string {
    return this._config.testProperty;
  }
}
