/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";

import {
  Extendable,
  ExtensionError,
  ExtensionFactory,
  ExtensionsConfig,
  Types,
} from "..";

import { ConcreteTest, Test, TestConfig } from "./Test";
import { ConcreteTestExtension, TestExtension } from "./TestExtension";

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

    setup.useExtension(ConcreteTestExtension);
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
    const setup = new TestSetup(new Container(), extensionsConfig);

    const testedFunction = () => setup.start();
    expect(testedFunction)
      .to.throw(ExtensionError)
      .with.property(
        "message",
        'testType extension "testName" is not registered.'
      );
  });
});

class TestSetup extends Extendable {
  constructor(public container: Container, config: ExtensionsConfig) {
    super();

    this.requireExtension(new ExtensionFactory(TestExtension.extensionType));

    container
      .bind<ExtensionsConfig>(Types.extensionsConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindExtensions(this.container);
  }
}

class TestSetupNoFactory extends Extendable {
  constructor(public container: Container, config: ExtensionsConfig) {
    super();

    container
      .bind<ExtensionsConfig>(Types.extensionsConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindExtensions(this.container);
  }
}
