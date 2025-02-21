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

import { Types } from "../common";

import { ClientStorage } from "./ClientStorage";
import { StrategyClientStorage } from "./StrategyClientStorage";

export abstract class ClientStorageDependency extends StrategyDependency {
  public static readonly dependencyType = "ClientStorage";
  public readonly dependencyType = ClientStorageDependency.dependencyType;

  public override registerStrategy(
    container: DIContainer,
    config: DependencyConfig
  ): void {
    if (!config.dependencyName)
      throw new ConfigError<DependencyConfig>("dependencyName");

    container.registerFactory<ClientStorage>(
      Types.Client.clientStorage,
      (c) => {
        const storagesInstances = c.resolveAll<StrategyInstance<ClientStorage>>(
          StrategyInstance<ClientStorage>
        );
        return new StrategyClientStorage(storagesInstances);
      }
    );
  }

  public override _registerInstance(
    container: DIContainer,
    childContainer: DIContainer,
    _config: DependencyConfig
  ): void {
    container.registerFactory<StrategyInstance<ClientStorage>>(
      StrategyInstance<ClientStorage>,
      (_c) =>
        new StrategyInstance<ClientStorage>(
          childContainer.resolve<ClientStorage>(Types.Client.clientStorage),
          this.dependencyName
        )
    );
  }
}
