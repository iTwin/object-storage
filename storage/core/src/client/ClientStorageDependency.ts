/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import {
  DependencyConfig,
  DIContainer,
  NamedDependency,
} from "@itwin/cloud-agnostic-core";

import { ClientStorage } from "./ClientStorage";

export abstract class ClientStorageDependency extends NamedDependency {
  public static readonly dependencyType = "ClientStorage";
  public readonly dependencyType = ClientStorageDependency.dependencyType;

  protected override _registerInstance(
    container: DIContainer,
    childContainer: DIContainer,
    config: DependencyConfig
  ): void {
    if (!config.instanceName)
      throw new ConfigError<DependencyConfig>("instanceName");

    this.bindNamed(
      container,
      childContainer,
      ClientStorage,
      config.instanceName
    );
  }
}
