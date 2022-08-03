/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Bindable, DependenciesConfig, Types } from "..";

import {
  DefaultTestDependencies,
  DefaultTestDependenciesWithInstances,
  TestDependency,
} from "./TestDependency";

export class TestSetup extends Bindable {
  constructor(public container: Container, config: DependenciesConfig) {
    super();

    this.requireDependency(TestDependency.dependencyType);
    DefaultTestDependencies.apply(this);

    container
      .bind<DependenciesConfig>(Types.dependenciesConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}

export class TestSetupWithNamedInstances extends Bindable {
  constructor(public container: Container, config: DependenciesConfig) {
    super();

    this.requireDependency(TestDependency.dependencyType);
    DefaultTestDependenciesWithInstances.apply(this);

    container
      .bind<DependenciesConfig>(Types.dependenciesConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}

export class TestSetupNoFactory extends Bindable {
  constructor(public container: Container, config: DependenciesConfig) {
    super();

    container
      .bind<DependenciesConfig>(Types.dependenciesConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}

export class TestSetupNoDefaultDependencies extends Bindable {
  constructor(public container: Container, config: DependenciesConfig) {
    super();

    this.requireDependency(TestDependency.dependencyType);

    container
      .bind<DependenciesConfig>(Types.dependenciesConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}
