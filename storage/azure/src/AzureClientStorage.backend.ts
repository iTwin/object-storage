import { BlockBlobClient } from "@azure/storage-blob";

import { AzureFrontendStorage } from "./AzureClientStorage";
import { BlockBlobClientWrapper } from "./BlockBlobClientWrapper.backend";

export class AzureClientStorage extends AzureFrontendStorage {
  protected override getBlockBlobClientWrapper(
    blobClient: BlockBlobClient
  ): BlockBlobClientWrapper {
    return new BlockBlobClientWrapper(blobClient);
  }
}
