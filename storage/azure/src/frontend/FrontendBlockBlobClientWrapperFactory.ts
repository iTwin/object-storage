/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { BlockBlobClient } from "@azure/storage-blob";
import { injectable } from "inversify";
import { FrontendUrlTransferInput, instanceOfUrlInput, ObjectReference } from "@itwin/object-storage-core/lib/frontend";
import { AzureTransferConfigInput, buildBlobUrlFromConfig } from ".";
import { FrontendBlockBlobClientWrapper } from "./FrontendBlockBlobClientWrapper";

type ConfigInput = AzureTransferConfigInput & { reference: ObjectReference };

@injectable()
export class FrontendBlockBlobClientWrapperFactory {
  public create(
    input: FrontendUrlTransferInput | ConfigInput
  ): FrontendBlockBlobClientWrapper {
    const blobClient = new BlockBlobClient(
      instanceOfUrlInput(input)
        ? input.url
        : buildBlobUrlFromConfig(input.transferConfig, input.reference)
    );
    return new FrontendBlockBlobClientWrapper(blobClient);
  }
}
