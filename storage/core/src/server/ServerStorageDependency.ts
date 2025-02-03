/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import {
  DIContainer,
  NamedDependency,
  NamedDependencyConfig,
} from "@itwin/cloud-agnostic-core";

import { ServerStorage } from "./ServerStorage";

export abstract class ServerStorageDependency extends NamedDependency {
  public static readonly dependencyType = "ServerStorage";
  public readonly dependencyType = ServerStorageDependency.dependencyType;

  protected override _registerInstance(
    container: DIContainer,
    childContainer: DIContainer,
    config: NamedDependencyConfig
  ): void {
    if (!config.instanceName)
      throw new ConfigError<NamedDependencyConfig>("instanceName");

    this.bindNamed(
      container,
      childContainer,
      ServerStorage,
      config.instanceName
    );
  }
}
