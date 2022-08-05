/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ConfigError } from "@itwin/cloud-agnostic-core/lib/internal";

import { DependencyConfig, NamedDependency } from "@itwin/cloud-agnostic-core";

import { ServerStorage } from "./ServerStorage";

export abstract class ServerStorageDependency extends NamedDependency {
  public static readonly dependencyType = "ServerStorage";
  public readonly dependencyType = ServerStorageDependency.dependencyType;

  protected override _registerInstance(
    container: Container,
    childContainer: Container,
    config: DependencyConfig
  ): void {
    if (!config.instanceName)
      throw new ConfigError<DependencyConfig>("instanceName");

    this.bindNamed(
      container,
      childContainer,
      ServerStorage,
      config.instanceName
    );
  }
}
