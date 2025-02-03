/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorageTestSetup } from "@itwin/object-storage-tests-frontend/lib/FrontendStorageTestSetup";

import { TypedDependencyConfig } from "@itwin/cloud-agnostic-core";

import { MinioFrontendStorageBindings } from "../../../frontend";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName: "minio",
    },
  } as TypedDependencyConfig,
};
const setup = new FrontendStorageTestSetup(
  config,
  MinioFrontendStorageBindings,
  "http://localhost:1222",
  "minio"
);
setup.setGlobals();
