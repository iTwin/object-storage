/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ContainerClient } from "@azure/storage-blob";
import { injectable } from "inversify";

import { AzureDirectoryTransferConfigInput } from "../../../common";
import { buildContainerUrl } from "../../../common/internal";

import { ContainerClientWrapper } from "./ContainerClientWrapper";

@injectable()
export class ContainerClientWrapperFactory {
  public create(
    input: AzureDirectoryTransferConfigInput
  ): ContainerClientWrapper {
    const containerClient = new ContainerClient(buildContainerUrl(input));
    return new ContainerClientWrapper(containerClient);
  }
}
