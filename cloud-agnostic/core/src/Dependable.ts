/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Dependency } from "./Dependency";
import { DependenciesConfig } from "./DependencyConfig";
import { DependencyFactory } from "./DependencyFactory";
import { DependencyError } from "./Errors";
import { Types } from "./Types";

export abstract class Dependable {
  private _dependencyFactories = new Map<string, DependencyFactory>();

  protected requireDependency(dependencyType: string): void {
    const factory = new DependencyFactory(dependencyType);
    this._dependencyFactories.set(factory.dependencyType, factory);
  }

  public useDependency(dependencyConstructor: new () => Dependency): void {
    const dependency = new dependencyConstructor();
    const factory = this._dependencyFactories.get(dependency.dependencyType);

    if (!factory)
      throw new DependencyError(
        `factory is not registered, use "${Dependable.prototype.requireDependency.name}" method`,
        dependency.dependencyType
      );

    factory.addDependency(dependency);
  }

  // should be protected but is set public for tests
  public registerDependencies(container: Container): void {
    const config = container.get<DependenciesConfig>(Types.dependenciesConfig);

    this._dependencyFactories.forEach((factory) => {
      const dependencyConfig = config[factory.dependencyType];
      factory
        .getDependency(dependencyConfig.dependencyName)
        .register(container, dependencyConfig);
    });
  }
}
