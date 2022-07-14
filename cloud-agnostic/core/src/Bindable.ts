/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Dependency } from "./Dependency";
import { DependenciesConfig } from "./DependencyConfig";
import { DependencyFactory } from "./DependencyFactory";
import { DependencyError } from "./internal";
import { Types } from "./Types";

export abstract class Bindable {
  private _dependencyFactories = new Map<string, DependencyFactory>();

  protected requireDependency(dependencyType: string): void {
    const factory = new DependencyFactory(dependencyType);
    this._dependencyFactories.set(factory.dependencyType, factory);
  }

  public useBindings(bindings: new () => Dependency): void {
    const dependencyBindings = new bindings();
    const factory = this._dependencyFactories.get(
      dependencyBindings.dependencyType
    );

    if (!factory)
      throw new DependencyError(
        `factory is not registered, use "${Bindable.prototype.requireDependency.name}" method`,
        dependencyBindings.dependencyType
      );

    factory.addDependency(dependencyBindings);
  }

  protected bindDependencies(container: Container): void {
    const config = container.get<DependenciesConfig>(Types.dependenciesConfig);

    this._dependencyFactories.forEach((factory) => {
      const dependencyConfig = config[factory.dependencyType];
      factory
        .getDependency(dependencyConfig.dependencyName)
        .register(container, dependencyConfig);
    });
  }
}
