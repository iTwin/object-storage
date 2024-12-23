/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Dependency } from "./Dependency";
import { DependencyConfig } from "./DependencyConfig";
import { DIContainer } from "./DIContainer";
import { DIIdentifier } from "./internal";

export class NamedInstance<T> {
  constructor(
    public readonly instance: T,
    public readonly instanceName: string
  ) {}
}

export abstract class NamedDependency extends Dependency {
  protected abstract _registerInstance(
    container: DIContainer,
    childContainer: DIContainer,
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

  protected bindNamed<T>(
    container: DIContainer,
    childContainer: DIContainer,
    serviceIdentifier: DIIdentifier<T>,
    instanceName: string
  ): void {
    container.registerFactory<NamedInstance<T>>(NamedInstance<T>, () => {
      return new NamedInstance<T>(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        childContainer.resolve(serviceIdentifier),
        instanceName
      );
    });
    container.registerNamedFactory<T>(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      serviceIdentifier,
      () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return childContainer.resolve(serviceIdentifier);
      },
      instanceName
    );
  }
}
