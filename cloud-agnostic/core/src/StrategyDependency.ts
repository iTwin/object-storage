/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Dependency } from "./Dependency";
import { DependencyConfig } from "./DependencyConfig";
import { DIContainer } from "./DIContainer";

export class StrategyInstance<T> {
  constructor(
    public readonly instance: T,
    public readonly instanceName: string
  ) {}
}

export abstract class StrategyDependency extends Dependency {
  protected abstract _registerInstance(
    container: DIContainer,
    childContainer: DIContainer,
    config: DependencyConfig
  ): void;

  public abstract registerStrategy(
    container: DIContainer,
    config: DependencyConfig
  ): void;

  public registerInstance(
    container: DIContainer,
    config: DependencyConfig
  ): void {
    const childContainer = container.createChild();

    this.register(childContainer, config);
    this._registerInstance(container, childContainer, config);
  }
}
