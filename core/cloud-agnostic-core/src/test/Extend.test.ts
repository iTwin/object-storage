/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";

import {
  extend,
  ExtensionError,
  ExtensionFactory,
  ExtensionRegistration,
  ExtensionsConfig,
  FactoryRegistration,
} from "..";

import { ConcreteTest, Test, TestConfig } from "./Test";
import { ConcreteTestExtension, TestExtension } from "./TestExtension";
import { TestSetup } from "./TestSetup";

const testFactoryRegistration: FactoryRegistration<TestExtension> = {
  extensionType: TestExtension.extensionType,
  factoryConstructor: ExtensionFactory,
};

const testExtensionRegistration: ExtensionRegistration<TestExtension> = {
  extensionConstructor: ConcreteTestExtension,
  extensionName: ConcreteTestExtension.extensionName,
  extensionType: TestExtension.extensionType,
};

const testConfig: TestConfig = {
  extensionName: "testName",
  testProperty: "testProperty",
};

const extensionsConfig: ExtensionsConfig = {
  testType: testConfig,
};

describe(`${extend.name}`, () => {
  const extendedSetup = extend(TestSetup);

  describe(`${extendedSetup.name}`, () => {
    it(`should resolve registered extension`, () => {
      const setup = new extendedSetup(new Container(), extensionsConfig);

      setup.requireExtension(testFactoryRegistration);
      setup.useExtension(testExtensionRegistration);
      setup.bindExtensions(setup.container);

      const test = setup.container.get(Test);
      expect(test instanceof ConcreteTest).to.be.true;
      expect(test.property === "testProperty").to.be.true;
    });

    it(`should throw if test storage extension is not registered`, () => {
      const setup = new extendedSetup(new Container(), extensionsConfig);
      setup.requireExtension(testFactoryRegistration);

      const testedFunction = () => setup.bindExtensions(setup.container);
      expect(testedFunction)
        .to.throw(ExtensionError)
        .with.property(
          "message",
          'testType extension "testName" is not registered.'
        );
    });

    it(`should throw if extension factory is not registered`, () => {
      const setup = new extendedSetup(new Container(), extensionsConfig);

      const testedFunction = () =>
        setup.useExtension(testExtensionRegistration);
      expect(testedFunction)
        .to.throw(ExtensionError)
        .with.property(
          "message",
          'testType factory is not registered, use "requireExtension" method.'
        );
    });
  });
});
