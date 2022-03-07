/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Dependable, Dependency } from "..";

import { ConcreteTest, Test, TestConfig, testConfigType } from "./Test";

export class DefaultTestDependencies {
  public static apply(dependable: Dependable): void {
    dependable.useDependency(ConcreteTestDependencyBindings);
  }
}

export abstract class TestDependency extends Dependency {
  public static readonly dependencyType = "testType";
  public readonly dependencyType = TestDependency.dependencyType;
}

export class ConcreteTestDependencyBindings extends TestDependency {
  public readonly dependencyName = "testName";

  public register(container: Container, config: TestConfig): void {
    container.bind<TestConfig>(testConfigType).toDynamicValue(() => config);
    container.bind(Test).to(ConcreteTest).inSingletonScope();
  }
}