/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Dependency } from "@itwin/cloud-agnostic-core";

export abstract class ClientStorageDependency extends Dependency {
  public static readonly dependencyType = "ClientStorage";
  public readonly dependencyType = ClientStorageDependency.dependencyType;
}
