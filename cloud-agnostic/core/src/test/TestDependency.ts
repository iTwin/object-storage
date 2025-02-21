/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Bindable, Dependency, StrategyDependency, StrategyInstance } from "..";
import { DependencyConfig, NamedDependencyConfig } from "../DependencyConfig";
import { DIContainer } from "../DIContainer";
import { ConfigError } from "../internal";
import { NamedDependency } from "../NamedDependency";

import {
  ConcreteStrategyTest,
  StrategyTest,
  StrategyTestBase,
} from "./StrategyTest";
import { ConcreteTest, NamedTestConfig, Test, TestConfig } from "./Test";
import { TestTypes } from "./TestTypes";

export abstract class TestDependency extends Dependency {
  public static readonly dependencyType = "testType";
  public readonly dependencyType = TestDependency.dependencyType;
}

export abstract class TestNamedDependency extends NamedDependency {
  public static readonly dependencyType = "testNamedType";
  public readonly dependencyType = TestNamedDependency.dependencyType;
}

export abstract class TestStrategyDependency extends StrategyDependency {
  public static readonly dependencyType = "testStrategyType";
  public readonly dependencyType = TestStrategyDependency.dependencyType;

  public register(container: DIContainer, config?: DependencyConfig): void {
    if (!config?.dependencyName)
      throw new ConfigError<DependencyConfig>("dependencyName");
  }

  public registerStrategy(
    container: DIContainer,
    _config?: DependencyConfig
  ): void {
    container.registerFactory<StrategyTestBase>(
      TestTypes.strategyTestBase,
      (c: DIContainer) => {
        const strategyInstances = c.resolveAll<
          StrategyInstance<ConcreteStrategyTest>
        >(StrategyInstance<ConcreteStrategyTest>);
        const strategyMap = new Map<string, StrategyTestBase>();
        for (const instance of strategyInstances) {
          strategyMap.set(instance.instanceName, instance.instance);
        }
        return new StrategyTest(strategyMap);
      }
    );
  }
}

export class ConcreteTestDependencyBindings extends TestDependency {
  public readonly dependencyName = "testName";

  public register(container: DIContainer, config: TestConfig): void {
    container.registerInstance<TestConfig>(TestTypes.testConfig, config);
    container.registerFactory<Test>(
      TestTypes.test,
      (c: DIContainer) =>
        new ConcreteTest(c.resolve<TestConfig>(TestTypes.testConfig))
    );
  }
}

export class ConcreteTestDependencyBindingsWithInstances extends TestNamedDependency {
  public readonly dependencyName = "testName";

  public register(container: DIContainer, config: NamedTestConfig): void {
    container.registerInstance<NamedTestConfig>(
      TestTypes.namedTestConfig,
      config
    );
    container.registerFactory<Test>(
      TestTypes.test,
      (c: DIContainer) =>
        new ConcreteTest(c.resolve<TestConfig>(TestTypes.namedTestConfig))
    );
  }

  protected override _registerInstance(
    container: DIContainer,
    childContainer: DIContainer,
    config: NamedDependencyConfig
  ): void {
    if (!config.instanceName)
      throw new ConfigError<NamedDependencyConfig>("instanceName");

    this.bindNamed(
      container,
      childContainer,
      TestTypes.test,
      config.instanceName
    );
  }
}

export class ConcreteStrategyDependencyClass1 extends TestStrategyDependency {
  public override dependencyName = "testName1";
  protected _testProperty = "testProperty1";

  public constructor() {
    super();
  }

  public override _registerInstance(
    container: DIContainer,
    _childContainer: DIContainer,
    _config: TestConfig
  ): void {
    container.registerFactory<StrategyInstance<ConcreteStrategyTest>>(
      StrategyInstance<ConcreteStrategyTest>,
      () =>
        new StrategyInstance<ConcreteStrategyTest>(
          new ConcreteStrategyTest({
            dependencyName: this.dependencyName,
            testProperty: this._testProperty,
          }),
          this.dependencyName
        )
    );
  }
}

export class ConcreteStrategyDependencyClass2 extends ConcreteStrategyDependencyClass1 {
  public override dependencyName = "testName2";
  protected override _testProperty = "testProperty2";
}

export class DefaultTestDependencies {
  public static apply(dependable: Bindable): void {
    dependable.useBindings(ConcreteTestDependencyBindings);
  }
}

export class DefaultTestDependenciesWithInstances {
  public static apply(dependable: Bindable): void {
    dependable.useBindings(ConcreteTestDependencyBindingsWithInstances);
  }
}

export class DefaultTestStrategyDependencies {
  public static apply(dependable: Bindable): void {
    dependable.useBindings(ConcreteStrategyDependencyClass1);
    dependable.useBindings(ConcreteStrategyDependencyClass2);
  }
}
