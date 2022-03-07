/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Dependency } from "@itwin/cloud-agnostic-core";

export abstract class ServerSideStorageDependency extends Dependency {
  public static readonly dependencyType = "ServerSideStorage";
  public readonly dependencyType = ServerSideStorageDependency.dependencyType;
}

export abstract class ClientSideStorageDependency extends Dependency {
  public static readonly dependencyType = "ClientSideStorage";
  public readonly dependencyType = ClientSideStorageDependency.dependencyType;
}
