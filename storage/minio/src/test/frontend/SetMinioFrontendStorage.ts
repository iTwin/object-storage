/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorageSetter } from "@itwin/object-storage-tests-frontend/lib/FrontendStorageSetter";
import { MinioFrontendStorageBindings } from "../../frontend";

const config = {
  FrontendStorage: {
    dependencyName: "minio",
    bucket: "foo"
  },
}
const storageSetter = new FrontendStorageSetter(config, MinioFrontendStorageBindings);
storageSetter.setStorageOnWindow();
