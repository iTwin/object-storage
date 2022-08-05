/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container, interfaces } from "inversify";

import { Dependency } from "./Dependency";
import { DependencyConfig } from "./DependencyConfig";

export abstract class NamedDependency extends Dependency {
  protected abstract _registerInstance(
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
    this._registerInstance(container, childContainer, config);
  }

  protected bindNamed<T>(
    container: Container,
    childContainer: Container,
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
    instanceName: string
  ): void {
    container
      .bind(serviceIdentifier)
      .toDynamicValue(() => {
        return childContainer.get(serviceIdentifier);
      })
      .inSingletonScope()
      .whenTargetNamed(instanceName);
  }
}
