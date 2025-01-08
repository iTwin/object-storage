/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Bindable, Dependency } from "..";
import { DependencyConfig } from "../DependencyConfig";
import { DIContainer } from "../DIContainer";
import { ConfigError } from "../internal";
import { NamedDependency } from "../NamedDependency";

import { ConcreteTest, Test, TestConfig, testConfigType } from "./Test";

export abstract class TestDependency extends Dependency {
  public static readonly dependencyType = "testType";
  public readonly dependencyType = TestDependency.dependencyType;
}

export abstract class TestNamedDependency extends NamedDependency {
  public static readonly dependencyType = "testType";
  public readonly dependencyType = TestDependency.dependencyType;
}

export class ConcreteTestDependencyBindings extends TestDependency {
  public readonly dependencyName = "testName";

  public register(container: DIContainer, config: TestConfig): void {
    container.registerInstance<TestConfig>(testConfigType, config);
    container.registerFactory<Test>(
      Test,
      (c: DIContainer) =>
        new ConcreteTest(c.resolve<TestConfig>(testConfigType))
    );
  }
}
export class ConcreteTestDependencyBindingsWithInstances extends TestNamedDependency {
  public readonly dependencyName = "testName";

  public register(container: DIContainer, config: TestConfig): void {
    container.registerInstance<TestConfig>(testConfigType, config);
    container.registerFactory<Test>(
      Test,
      (c: DIContainer) =>
        new ConcreteTest(c.resolve<TestConfig>(testConfigType))
    );
  }

  protected override _registerInstance(
    container: DIContainer,
    childContainer: DIContainer,
    config: DependencyConfig
  ): void {
    if (!config.instanceName)
      throw new ConfigError<DependencyConfig>("instanceName");

    this.bindNamed(container, childContainer, Test, config.instanceName);
  }
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
