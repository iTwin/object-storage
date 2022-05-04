/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";
import { it } from "mocha";

import { Dependency, DependencyConfig } from "@itwin/cloud-agnostic-core";

export interface DependencyBindingsTestCase {
  symbolUnderTestName: string;
  functionUnderTest: (container: Container) => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectedCtor: new (...args: any[]) => unknown;
}

export function testBindings(
  bindings: Dependency,
  config: DependencyConfig | undefined,
  testCases: DependencyBindingsTestCase[]
): void {
  for (const testCase of testCases) {
    it(`should register ${testCase.symbolUnderTestName}`, () => {
      const container = new Container();
      bindings.register(container, config);

      const functionUnderTest = () => testCase.functionUnderTest(container);
      expect(functionUnderTest).to.not.throw();
    });

    it(`should register ${testCase.symbolUnderTestName} as a singleton`, () => {
      const container = new Container();
      bindings.register(container, config);
      const instance1 = testCase.functionUnderTest(container);
      const instance2 = testCase.functionUnderTest(container);

      expect(instance1).to.be.equal(instance2);
    });

    it(`should resolve ${testCase.symbolUnderTestName} to ${testCase.expectedCtor.name}`, () => {
      const container = new Container();
      bindings.register(container, config);
      const instance = testCase.functionUnderTest(container);

      expect(Object.getPrototypeOf(instance).constructor.name).to.be.equal(
        testCase.expectedCtor.name
      );
    });
  }
}
