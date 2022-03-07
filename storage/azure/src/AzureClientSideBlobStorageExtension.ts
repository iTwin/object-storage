/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import {
  ClientSideStorage,
  ClientSideStorageExtension,
} from "@itwin/object-storage-core";

import { AzureClientSideBlobStorage } from "./AzureClientSideBlobStorage";

export class AzureClientSideBlobStorageExtension extends ClientSideStorageExtension {
  public readonly extensionName: string = "azure";

  public override bind(container: Container): void {
    container.bind(ClientSideStorage).to(AzureClientSideBlobStorage);
  }
}
