/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { FrontendStorageTestSetup } from "@itwin/object-storage-tests-frontend/lib/FrontendStorageTestSetup";

import { TypedDependencyConfig } from "@itwin/cloud-agnostic-core";

import { Constants } from "../../../common";
import { OssFrontendStorageBindings } from "../../../frontend";

const config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FrontendStorage: {
    bindingStrategy: "StrategyDependency",
    instance: {
      dependencyName: Constants.storageType,
    },
  } as TypedDependencyConfig,
};
const setup = new FrontendStorageTestSetup(
  config,
  OssFrontendStorageBindings,
  "http://localhost:1223",
  Constants.storageType
);
setup.setGlobals();
