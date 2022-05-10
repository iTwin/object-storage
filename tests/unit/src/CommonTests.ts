/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";
import { it } from "mocha";

import { Dependency, DependencyConfig } from "@itwin/cloud-agnostic-core";
import { ServerStorageDependency } from "@itwin/object-storage-core";

export interface DependencyBindingsTestCase {
  testedClassIdentifier: string;
  testedFunction: (container: Container) => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectedCtor: new (...args: any[]) => unknown;
}

export interface InvalidConfigTestCase {
  config: DependencyConfig;
  expectedErrorMessage: string;
}

export function testBindings(
  bindings: Dependency,
  config: DependencyConfig | undefined,
  testCases: DependencyBindingsTestCase[]
): void {
  for (const testCase of testCases) {
    it(`should register ${testCase.testedClassIdentifier}`, () => {
      const container = new Container();
      bindings.register(container, config);

      const testedFunction = () => testCase.testedFunction(container);
      expect(testedFunction).to.not.throw();
    });

    it(`should register ${testCase.testedClassIdentifier} as a singleton`, () => {
      const container = new Container();
      bindings.register(container, config);
      const instance1 = testCase.testedFunction(container);
      const instance2 = testCase.testedFunction(container);

      expect(instance1).to.be.equal(instance2);
    });

    it(`should resolve ${testCase.testedClassIdentifier} to ${testCase.expectedCtor.name}`, () => {
      const container = new Container();
      bindings.register(container, config);
      const instance = testCase.testedFunction(container);

      expect(Object.getPrototypeOf(instance).constructor.name).to.be.equal(
        testCase.expectedCtor.name
      );
    });
  }
}

export function testInvalidServerConfig(
  serverBindings: ServerStorageDependency,
  testCases: InvalidConfigTestCase[]
): void {
  for (const testCase of testCases) {
    it(`should throw if dependency config is invalid (${testCase.expectedErrorMessage})`, () => {
      const container = new Container();

      const testedFunction = () =>
        serverBindings.register(container, testCase.config);
      expect(testedFunction)
        .to.throw(Error)
        .with.property("message", testCase.expectedErrorMessage);
    });
  }
}
