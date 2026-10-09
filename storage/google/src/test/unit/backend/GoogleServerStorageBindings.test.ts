/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { expect } from "chai";

import { InversifyWrapper } from "@itwin/cloud-agnostic-core/lib/inversify";

import { DIContainer } from "@itwin/cloud-agnostic-core";
import { ServerStorage, Types as CoreTypes } from "@itwin/object-storage-core";
import {
  DependencyBindingsTestCase,
  InvalidConfigTestCase,
  testBindings,
  testInvalidServerConfig,
} from "@itwin/object-storage-tests-backend-unit";

import { Constants, Types } from "../../../common";
import {
  GoogleServerStorageBindings,
  GoogleServerStorageBindingsConfig,
  GoogleServerStorage,
  StorageWrapperFactory,
  StorageWrapper,
} from "../../../server";
import { StorageControlClientWrapper } from "../../../server/wrappers/StorageControlClientWrapper";

describe(`${GoogleServerStorageBindings.name}`, () => {
  const serverBindings = new GoogleServerStorageBindings();

  describe(`${serverBindings.register.name}()`, () => {
    const invalidConfigTestCases: InvalidConfigTestCase[] = [
      {
        config: {
          dependencyName: Constants.storageType,
        } as unknown as GoogleServerStorageBindingsConfig,
        expectedErrorMessage: "projectId is not defined in configuration",
      },
      {
        config: {
          dependencyName: Constants.storageType,
          projectId: "testProjectId",
        } as unknown as GoogleServerStorageBindingsConfig,
        expectedErrorMessage: "bucketName is not defined in configuration",
      },
      ...[
        "bucket'name",
        "bucket\\name",
        "bucket/name",
        "bucket name",
        "ab",
        "-bucket",
        "bucket.",
        "BucketName",
        "testBucketName",
        "a..b",
        ".bucket",
        "a".repeat(64),
        `${"a".repeat(64)}.bucket`,
        [55, 55, 55, 55].map((length) => "a".repeat(length)).join("."),
        "192.168.5.4",
        "goog-bucket",
        "my-google-bucket",
      ].map((bucketName) => ({
        config: {
          dependencyName: Constants.storageType,
          projectId: "testProjectId",
          bucketName,
        } as GoogleServerStorageBindingsConfig,
        expectedErrorMessage:
          "bucketName is not a valid Google Cloud Storage bucket name",
      })),
    ];
    testInvalidServerConfig(serverBindings, invalidConfigTestCases);

    const config: GoogleServerStorageBindingsConfig = {
      dependencyName: Constants.storageType,
      projectId: "testProjectId",
      bucketName: "test-bucket-name",
    };

    [
      "abc",
      "test_bucket-name.1",
      "a".repeat(63),
      [63, 63, 63, 30].map((length) => "a".repeat(length)).join("."),
    ].forEach((bucketName) => {
      it(`should accept valid bucket name (${bucketName.length} characters)`, () => {
        expect(() =>
          serverBindings.register(InversifyWrapper.create(), {
            ...config,
            bucketName,
          })
        ).to.not.throw();
      });
    });

    const bindingsTestCases: DependencyBindingsTestCase[] = [];
    [
      {
        testedClassIdentifier: ServerStorage.name,
        testedFunction: (c: DIContainer) =>
          c.resolve<ServerStorage>(CoreTypes.Server.serverStorage),
        expectedCtor: GoogleServerStorage,
      },
      {
        testedClassIdentifier: Types.GoogleServer.config.toString(),
        testedFunction: (c: DIContainer) =>
          c.resolve<GoogleServerStorageBindingsConfig>(
            Types.GoogleServer.config
          ),
        expectedCtor: Object,
      },
      {
        testedClassIdentifier: StorageControlClientWrapper.name,
        testedFunction: (c: DIContainer) =>
          c.resolve(StorageControlClientWrapper),
        expectedCtor: StorageControlClientWrapper,
      },
      {
        testedClassIdentifier: StorageWrapperFactory.name,
        testedFunction: (c: DIContainer) => c.resolve(StorageWrapperFactory),
        expectedCtor: StorageWrapperFactory,
      },
      {
        testedClassIdentifier: StorageWrapper.name,
        testedFunction: (c: DIContainer) => c.resolve(StorageWrapper),
        expectedCtor: StorageWrapper,
      },
    ];
    testBindings(serverBindings, config, bindingsTestCases);
  });
});
