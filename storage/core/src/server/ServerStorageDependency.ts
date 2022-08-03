/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { DependencyConfig, NamedDependency } from "@itwin/cloud-agnostic-core";

import { ServerStorage } from "./ServerStorage";

export abstract class ServerStorageDependency extends NamedDependency {
  public static readonly dependencyType = "ServerStorage";
  public readonly dependencyType = ServerStorageDependency.dependencyType;

  public override registerInstance(
    container: Container,
    config: DependencyConfig
  ): void {
    super.registerNamedInstance(ServerStorage, container, config);
  }
}
