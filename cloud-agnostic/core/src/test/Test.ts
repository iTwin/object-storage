/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { DependencyConfig, NamedDependencyConfig } from "..";

export interface TestConfig extends DependencyConfig {
  testProperty: string;
}

export interface NamedTestConfig extends NamedDependencyConfig {
  testProperty: string;
}

export abstract class Test {
  abstract get property(): string;
  abstract get instanceName(): string | undefined;
}

export class ConcreteTest extends Test {
  constructor(private _config: TestConfig) {
    super();
  }

  public get property(): string {
    return this._config.testProperty;
  }

  public get instanceName(): string | undefined {
    return (this._config as unknown as NamedDependencyConfig).instanceName;
  }
}
