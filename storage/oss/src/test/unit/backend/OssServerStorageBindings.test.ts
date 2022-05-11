/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as Core from "@alicloud/pop-core";
import { Container } from "inversify";

import { TransferConfigProvider, Types } from "@itwin/object-storage-core";
import {
  Constants,
  DependencyBindingsTestCase,
  testBindings,
} from "@itwin/object-storage-tests-unit";

import {
  OssServerStorageBindings,
  OssTransferConfigProvider,
} from "../../../server";

describe(`${OssServerStorageBindings.name}`, () => {
  const serverBindings = new OssServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    const bindingsTestCases: DependencyBindingsTestCase[] = [
      {
        testedClassIdentifier: Types.Server.transferConfigProvider.toString(),
        testedFunction: (container: Container) =>
          container.get<TransferConfigProvider>(
            Types.Server.transferConfigProvider
          ),
        expectedCtor: OssTransferConfigProvider,
      },
      {
        testedClassIdentifier: Core.name,
        testedFunction: (container: Container) => container.get(Core),
        expectedCtor: Core,
      },
    ];
    testBindings(
      serverBindings,
      Constants.validS3ServerStorageConfig,
      bindingsTestCases
    );
  });
});
