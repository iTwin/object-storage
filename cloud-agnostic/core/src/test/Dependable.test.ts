/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";

import { Dependable, DependenciesConfig, DependencyError } from "..";

import { ConcreteTest, Test, TestConfig } from "./Test";
import { ConcreteTestDependencyBindings } from "./TestDependency";
import {
  TestSetup,
  TestSetupNoDefaultDependencies,
  TestSetupNoFactory,
} from "./TestSetup";

const testConfig: TestConfig = {
  dependencyName: "testName",
  testProperty: "testProperty",
};

const dependenciesConfig: DependenciesConfig = {
  testType: testConfig,
};

describe(`${Dependable.name}`, () => {
  it(`should resolve registered dependency`, () => {
    const setup = new TestSetup(new Container(), dependenciesConfig);

    setup.start();

    const test = setup.container.get(Test);
    expect(test instanceof ConcreteTest).to.be.true;
    expect(test.property === "testProperty").to.be.true;
  });

  it(`should throw if dependency factory is not registered`, () => {
    const setup = new TestSetupNoFactory(new Container(), dependenciesConfig);

    const testedFunction = () =>
      setup.useDependency(ConcreteTestDependencyBindings);
    expect(testedFunction)
      .to.throw(DependencyError)
      .with.property(
        "message",
        'testType factory is not registered, use "requireDependency" method.'
      );
  });

  it(`should throw if testName dependency is not registered`, () => {
    const setup = new TestSetupNoDefaultDependencies(
      new Container(),
      dependenciesConfig
    );

    const testedFunction = () => setup.start();
    expect(testedFunction)
      .to.throw(DependencyError)
      .with.property(
        "message",
        'testType dependency "testName" is not registered.'
      );
  });
});
