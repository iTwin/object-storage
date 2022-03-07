/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Dependable, DependenciesConfig, Types } from "..";

import { DefaultTestDependencies, TestDependency } from "./TestDependency";

export class TestSetup extends Dependable {
  constructor(public container: Container, config: DependenciesConfig) {
    super();

    this.requireDependency(TestDependency.dependencyType);
    DefaultTestDependencies.apply(this);

    container
      .bind<DependenciesConfig>(Types.dependenciesConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.registerDependencies(this.container);
  }
}

export class TestSetupNoFactory extends Dependable {
  constructor(public container: Container, config: DependenciesConfig) {
    super();

    container
      .bind<DependenciesConfig>(Types.dependenciesConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.registerDependencies(this.container);
  }
}

export class TestSetupNoDefaultDependencies extends Dependable {
  constructor(public container: Container, config: DependenciesConfig) {
    super();

    this.requireDependency(TestDependency.dependencyType);

    container
      .bind<DependenciesConfig>(Types.dependenciesConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.registerDependencies(this.container);
  }
}
