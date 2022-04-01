import { Container } from "inversify";

import { ClientStorage } from "@itwin/object-storage-core";
import {
  S3ClientStorageBindingsConfig,
  S3FrontendStorageBindings,
} from "@itwin/object-storage-s3/lib/frontend";

import { MinioFrontendStorage } from "./MinioClientStorage";

export class MinioFrontendStorageBindings extends S3FrontendStorageBindings {
  public override readonly dependencyName: string = "minio";

  public override register(
    container: Container,
    config: S3ClientStorageBindingsConfig
  ): void {
    super.register(container, config);

    container.rebind(ClientStorage).to(MinioFrontendStorage);
  }
}
