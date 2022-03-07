/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Extension } from "@itwin/cloud-agnostic-core";

export abstract class ServerSideStorageExtension extends Extension {
  public static readonly extensionType = "ServerSideStorage";
  public readonly extensionType = ServerSideStorageExtension.extensionType;
}

export abstract class ClientSideStorageExtension extends Extension {
  public static readonly extensionType = "ClientSideStorage";
  public readonly extensionType = ClientSideStorageExtension.extensionType;
}
