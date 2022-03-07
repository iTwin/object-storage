/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";

import { Extendable, ExtensionError, ExtensionsConfig } from "..";

import { ConcreteTest, Test, TestConfig } from "./Test";
import { ConcreteTestExtension } from "./TestExtension";
import {
  TestSetup,
  TestSetupNoDefaultExtensions,
  TestSetupNoFactory,
} from "./TestSetup";

const testConfig: TestConfig = {
  extensionName: "testName",
  testProperty: "testProperty",
};

const extensionsConfig: ExtensionsConfig = {
  testType: testConfig,
};

describe(`${Extendable.name}`, () => {
  it(`should resolve registered extension`, () => {
    const setup = new TestSetup(new Container(), extensionsConfig);

    setup.start();

    const test = setup.container.get(Test);
    expect(test instanceof ConcreteTest).to.be.true;
    expect(test.property === "testProperty").to.be.true;
  });

  it(`should throw if extension factory is not registered`, () => {
    const setup = new TestSetupNoFactory(new Container(), extensionsConfig);

    const testedFunction = () => setup.useExtension(ConcreteTestExtension);
    expect(testedFunction)
      .to.throw(ExtensionError)
      .with.property(
        "message",
        'testType factory is not registered, use "requireExtension" method.'
      );
  });

  it(`should throw if testName extension is not registered`, () => {
    const setup = new TestSetupNoDefaultExtensions(
      new Container(),
      extensionsConfig
    );

    const testedFunction = () => setup.start();
    expect(testedFunction)
      .to.throw(ExtensionError)
      .with.property(
        "message",
        'testType extension "testName" is not registered.'
      );
  });
});
