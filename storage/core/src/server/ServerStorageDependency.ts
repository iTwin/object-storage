/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { NamedDependency, DependencyConfig } from "@itwin/cloud-agnostic-core";
import { Container } from "inversify";
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
