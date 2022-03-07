/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  ClientSideStorage,
  ClientSideStorageDependency,
} from "@itwin/object-storage-core";

import { AzureClientSideBlobStorage } from "./AzureClientSideBlobStorage";

export class AzureClientSideBlobStorageBindings extends ClientSideStorageDependency {
  public readonly dependencyName: string = "azure";

  public override register(container: Container): void {
    container.bind(ClientSideStorage).to(AzureClientSideBlobStorage);
  }
}
