/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { expect } from "chai";

import { Bindable, DependenciesConfig, NamedInstance } from "..";
import { DependencyError, DependencyTypeError } from "../internal";
import { InversifyWrapper } from "../inversify";

import { StrategyTestBase } from "./StrategyTest";
import { ConcreteTest, NamedTestConfig, Test, TestConfig } from "./Test";
import { ConcreteTestDependencyBindings } from "./TestDependency";
import {
  TestSetup,
  TestSetupNoDefaultDependencies,
  TestSetupNoFactory,
  TestSetupWithNamedInstances,
  TestSetupWithStrategyInstances,
} from "./TestSetup";

const testConfig: TestConfig = {
  dependencyName: "testName",
  testProperty: "testProperty",
};

const testConfigWithOneInstance: NamedTestConfig[] = [
  {
    dependencyName: "testName",
    instanceName: "instanceName",
    testProperty: "testProperty",
  },
];

const testConfigWithMultipleInstances: NamedTestConfig[] = [
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
  testNamedType: {
    bindingStrategy: "NamedDependency",
    instances: testConfigWithOneInstance,
  },
};

const dependenciesConfigWithMultipleInstances: DependenciesConfig = {
  testNamedType: {
    bindingStrategy: "NamedDependency",
    instances: testConfigWithMultipleInstances,
  },
};

const dependenciesStrategyConfig: DependenciesConfig = {
  testStrategyType: {
    bindingStrategy: "StrategyDependency",
    instance: testConfig,
  },
};

const dependenciesConfig: DependenciesConfig = {
  testType: {
    bindingStrategy: "Dependency",
    instance: testConfig,
  },
};

function validateNamedTestObject(test: Test, config: NamedTestConfig) {
  expect(test instanceof ConcreteTest).to.be.true;
  expect(test.instanceName === config.instanceName).to.be.true;
  expect(test.property === config.testProperty).to.be.true;
}

describe(`${Bindable.name}`, () => {
  it(`should resolve registered dependency`, () => {
    const setup = new TestSetup(InversifyWrapper.create(), dependenciesConfig);

    setup.start();

    const test = setup.container.resolve(Test);
    expect(test instanceof ConcreteTest).to.be.true;
    expect(test.property === "testProperty").to.be.true;
  });

  it(`should throw if dependency factory is not registered`, () => {
    const setup = new TestSetupNoFactory(
      InversifyWrapper.create(),
      dependenciesConfig
    );

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
      InversifyWrapper.create(),
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
    const setup = new TestSetup(InversifyWrapper.create(), {
      testType: {
        bindingStrategy: "NamedDependency",
        instances: testConfigWithOneInstance,
      },
    });

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
      InversifyWrapper.create(),
      dependenciesConfigWithOneInstance
    );

    setup.start();

    const test = setup.container.resolveNamed(Test, "instanceName");
    validateNamedTestObject(test, testConfigWithOneInstance[0]);
  });

  it(`should resolve multiple registered named dependency instances by name`, () => {
    const setup = new TestSetupWithNamedInstances(
      InversifyWrapper.create(),
      dependenciesConfigWithMultipleInstances
    );

    setup.start();

    const test = setup.container.resolveNamed(
      Test,
      testConfigWithMultipleInstances[0].instanceName
    );
    const test2 = setup.container.resolveNamed(
      Test,
      testConfigWithMultipleInstances[1].instanceName
    );

    validateNamedTestObject(test, testConfigWithMultipleInstances[0]);
    validateNamedTestObject(test2, testConfigWithMultipleInstances[1]);
  });

  it(`should resolve multiple registered named dependency instances as array`, () => {
    const setup = new TestSetupWithNamedInstances(
      InversifyWrapper.create(),
      dependenciesConfigWithMultipleInstances
    );

    setup.start();

    const tests: NamedInstance<Test>[] = setup.container.resolveAll(
      NamedInstance<Test>
    );

    expect(tests.length).to.be.equal(2);
    validateNamedTestObject(
      tests[0]?.instance,
      testConfigWithMultipleInstances[0]
    );
    validateNamedTestObject(
      tests[1]?.instance,
      testConfigWithMultipleInstances[1]
    );
  });

  it(`should resolve strategy dependency with multiple instances`, () => {
    const setup = new TestSetupWithStrategyInstances(
      InversifyWrapper.create(),
      dependenciesStrategyConfig
    );

    setup.start();

    const test = setup.container.resolve(StrategyTestBase);

    expect(test.method("testName1")).to.be.equal("testProperty1");
    expect(test.method("testName2")).to.be.equal("testProperty2");
  });
});
