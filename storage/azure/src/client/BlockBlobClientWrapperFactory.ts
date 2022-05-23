/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";
import { FrontendUrlTransferInput, instanceOfUrlInput, ObjectReference } from "@itwin/object-storage-core";
import { AzureTransferConfigInput, buildBlobUrlFromConfig } from "../frontend";
import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper";

type ConfigInput = AzureTransferConfigInput & { reference: ObjectReference };

@injectable()
export class BlockBlobClientWrapperFactory {
  public create(
    input: FrontendUrlTransferInput | ConfigInput
  ): BlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfUrlInput(input)
        ? input.url
        : buildBlobUrlFromConfig(input.transferConfig, input.reference)
    );
    return new BlockBlobClientWrapper(blobClient);
  }
}
