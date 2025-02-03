/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import {
  DependencyConfig,
  DIContainer,
  StrategyDependency,
  StrategyInstance,
} from "@itwin/cloud-agnostic-core";

import { FrontendStorage } from "./FrontendStorage";
import { StrategyFrontendStorage } from "./StrategyFrontendStorage";

export abstract class FrontendStorageDependency extends StrategyDependency {
  public static readonly dependencyType = "FrontendStorage";
  public readonly dependencyType = FrontendStorageDependency.dependencyType;

  public override registerStrategy(
    container: DIContainer,
    config: DependencyConfig
  ): void {
    if (!config.dependencyName)
      throw new ConfigError<DependencyConfig>("dependencyName");

    container.registerFactory(FrontendStorage, (container) => {
      const storagesInstances = container.resolveAll<
        StrategyInstance<FrontendStorage>
      >(StrategyInstance<FrontendStorage>);
      return new StrategyFrontendStorage(storagesInstances);
    });
  }

  public override _registerInstance(
    container: DIContainer,
    childContainer: DIContainer,
    _config: DependencyConfig
  ): void {
    container.registerFactory<StrategyInstance<FrontendStorage>>(
      StrategyInstance<FrontendStorage>,
      (_c) =>
        new StrategyInstance<FrontendStorage>(
          childContainer.resolve(FrontendStorage),
          this.dependencyName
        )
    );
  }
}
