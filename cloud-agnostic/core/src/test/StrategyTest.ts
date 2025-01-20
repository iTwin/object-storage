/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { TestConfig } from "./Test";

export abstract class StrategyTestBase {
  abstract method(instance: string): string;
}

export class ConcreteStrategyTest extends StrategyTestBase {
  constructor(private _config: TestConfig) {
    super();
  }

  public get dependencyName(): string {
    return this._config.dependencyName;
  }

  public method(_instance: string): string {
    return this._config.testProperty;
  }
}

export class StrategyTest extends StrategyTestBase {
  constructor(private _instances: Map<string, StrategyTestBase>) {
    super();
  }

  public method(instance: string): string {
    return this._instances.get(instance)!.method(instance);
  }
}
