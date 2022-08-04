/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container, interfaces } from "inversify";

import { Dependency } from "./Dependency";
import { DependencyConfig } from "./DependencyConfig";

export abstract class NamedDependency extends Dependency {
  protected abstract bindInstances(
    container: Container,
    childContainer: Container,
    config: DependencyConfig
  ): void;

  public registerInstance(
    container: Container,
    config: DependencyConfig
  ): void {
    const childContainer = container.createChild();

    this.register(childContainer, config);
    this.bindInstances(container, childContainer, config);
  }

  protected bindInstance<TInstance>(
    container: Container,
    childContainer: Container,
    instanceType:
      | interfaces.Newable<TInstance>
      | interfaces.Abstract<TInstance>,
    instanceName: string
  ) {
    container
      .bind(instanceType)
      .toDynamicValue(() => {
        return childContainer.get(instanceType);
      })
      .inSingletonScope()
      .whenTargetNamed(instanceName);
  }
}
