/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { Container } from "inversify";

import { Bindable, DependenciesConfig, NamedInstance } from "..";
import { DependencyError, DependencyTypeError } from "../internal";

import { ConcreteTest, Test, TestConfig } from "./Test";
import { ConcreteTestDependencyBindings } from "./TestDependency";
import {
  TestSetup,
  TestSetupNoDefaultDependencies,
  TestSetupNoFactory,
  TestSetupWithNamedInstances,
} from "./TestSetup";

const testConfig: TestConfig = {
  dependencyName: "testName",
  testProperty: "testProperty",
};

const testConfigWithOneInstance: TestConfig[] = [
  {
    dependencyName: "testName",
    instanceName: "instanceName",
    testProperty: "testProperty",
  },
];

const testConfigWithMultipleInstances: TestConfig[] = [
  {
    dependencyName: "testName",
    instanceName: "instanceName",
    testProperty: "testProperty",
  },
  {
    dependencyName: "testName",
    instanceName: "instanceName2",
    testProperty: "testProperty2",
  },
];

const dependenciesConfigWithOneInstance: DependenciesConfig = {
  testType: testConfigWithOneInstance,
};

const dependenciesConfigWithMultipleInstances: DependenciesConfig = {
  testType: testConfigWithMultipleInstances,
};

const dependenciesConfig: DependenciesConfig = {
  testType: testConfig,
};

function validateTestObject(test: Test, config: TestConfig) {
  expect(test instanceof ConcreteTest).to.be.true;
  expect(test.instanceName === config.instanceName).to.be.true;
  expect(test.property === config.testProperty).to.be.true;
}

describe(`${Bindable.name}`, () => {
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
      setup.useBindings(ConcreteTestDependencyBindings);
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

  it(`should throw if testName does not support named dependency instances`, () => {
    const setup = new TestSetup(
      new Container(),
      dependenciesConfigWithMultipleInstances
    );

    const testedFunction = () => setup.start();
    expect(testedFunction)
      .to.throw(DependencyTypeError)
      .with.property(
        "message",
        'testType dependency "testName" does not support named dependency instances.'
      );
  });

  it(`should resolve registered named dependency instance`, () => {
    const setup = new TestSetupWithNamedInstances(
      new Container(),
      dependenciesConfigWithOneInstance
    );

    setup.start();

    const test = setup.container.getNamed(Test, "instanceName");
    validateTestObject(test, testConfigWithOneInstance[0]);
  });

  it(`should resolve multiple registered named dependency instances by name`, () => {
    const setup = new TestSetupWithNamedInstances(
      new Container(),
      dependenciesConfigWithMultipleInstances
    );

    setup.start();

    const test = setup.container.getNamed(
      Test,
      testConfigWithMultipleInstances[0].instanceName!
    );
    const test2 = setup.container.getNamed(
      Test,
      testConfigWithMultipleInstances[1].instanceName!
    );

    validateTestObject(test, testConfigWithMultipleInstances[0]);
    validateTestObject(test2, testConfigWithMultipleInstances[1]);
  });

  it(`should resolve multiple registered named dependency instances as array`, () => {
    const setup = new TestSetupWithNamedInstances(
      new Container(),
      dependenciesConfigWithMultipleInstances
    );

    setup.start();

    const tests: NamedInstance<Test>[] = setup.container.getAll(
      NamedInstance<Test>
    );

    expect(tests.length).to.be.equal(2);
    validateTestObject(tests[0]?.instance, testConfigWithMultipleInstances[0]);
    validateTestObject(tests[1]?.instance, testConfigWithMultipleInstances[1]);
  });
});
