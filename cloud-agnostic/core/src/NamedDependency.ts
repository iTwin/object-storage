/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container, interfaces } from "inversify";

import { Dependency } from "./Dependency";
import { DependencyConfig } from "./DependencyConfig";
import { ConfigError } from "./internal";

export abstract class NamedDependency extends Dependency {
  protected registerNamedInstance<TInstance>(
    instanceType:
      | interfaces.Newable<TInstance>
      | interfaces.Abstract<TInstance>,
    container: Container,
    config: DependencyConfig
  ): void {
    if (!config.instanceName)
      throw new ConfigError<DependencyConfig>("instanceName");

    const childContainer = container.createChild();

    this.register(childContainer, config);

    container
      .bind(instanceType)
      .toDynamicValue(() => {
        return childContainer.get(instanceType);
      })
      .inSingletonScope()
      .whenTargetNamed(config.instanceName);
  }

  public abstract registerInstance(
    container: Container,
    config: DependencyConfig
  ): void;
}
