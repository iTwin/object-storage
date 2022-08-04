/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { DependencyConfig, NamedDependency } from "@itwin/cloud-agnostic-core";

import { ServerStorage } from "./ServerStorage";
import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

export abstract class ServerStorageDependency extends NamedDependency {
  public static readonly dependencyType = "ServerStorage";
  public readonly dependencyType = ServerStorageDependency.dependencyType;

  protected override bindInstances(
    container: Container,
    childContainer: Container,
    config: DependencyConfig
  ): void {
    if (!config.instanceName)
      throw new ConfigError<DependencyConfig>("instanceName");

    this.bindInstance(
      container,
      childContainer,
      ServerStorage,
      config.instanceName
    );
  }
}
