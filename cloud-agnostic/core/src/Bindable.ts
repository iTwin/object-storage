/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Dependency } from "./Dependency";
import { DependenciesConfig, DependencyConfig } from "./DependencyConfig";
import { DependencyFactory } from "./DependencyFactory";
import { DIContainer } from "./DIContainer";
import { DependencyError } from "./internal";
import { StrategyDependency } from "./StrategyDependency";
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

  private bindStrategyDependencies(
    container: DIContainer,
    factory: DependencyFactory,
    config: DependencyConfig
  ): void {
    let first = true;
    for (const dependency of factory.getStrategyDependencies()) {
      if (!(dependency instanceof StrategyDependency)) continue;
      if (first) {
        first = false;
        dependency.registerStrategy(container, config);
      }
      dependency.registerInstance(container, config);
    }
  }

  private bindNamedDependencies(
    container: DIContainer,
    factory: DependencyFactory,
    configs: DependencyConfig[]
  ): void {
    for (const configInstance of configs) {
      factory
        .getNamedDependency(configInstance.dependencyName)
        .registerInstance(container, configInstance);
    }
  }

  private bindDependency(
    container: DIContainer,
    factory: DependencyFactory,
    config: DependencyConfig
  ) {
    factory.getDependency(config.dependencyName).register(container, config);
  }

  protected bindDependencies(container: DIContainer): void {
    const config = container.resolve<DependenciesConfig>(
      Types.dependenciesConfig
    );

    this._dependencyFactories.forEach((factory) => {
      const dependencyConfig = config[factory.dependencyType];
      switch (dependencyConfig.bindingStrategy) {
        case "NamedDependency": {
          this.bindNamedDependencies(
            container,
            factory,
            dependencyConfig.instances
          );
          break;
        }
        case "StrategyDependency": {
          this.bindStrategyDependencies(
            container,
            factory,
            dependencyConfig.instance
          );
          break;
        }
        default: {
          this.bindDependency(container, factory, dependencyConfig.instance);
          break;
        }
      }
    });
  }
}
