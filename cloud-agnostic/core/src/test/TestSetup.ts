/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Bindable, DependenciesConfig, Types } from "..";
import { DIContainer } from "../DIContainer";

import {
  DefaultTestDependencies,
  DefaultTestDependenciesWithInstances,
  DefaultTestStrategyDependencies,
  TestDependency,
  TestNamedDependency,
  TestStrategyDependency,
} from "./TestDependency";

export class TestSetup extends Bindable {
  constructor(public container: DIContainer, config: DependenciesConfig) {
    super();

    this.requireDependency(TestDependency.dependencyType);
    DefaultTestDependencies.apply(this);

    this.container.registerInstance<DependenciesConfig>(
      Types.dependenciesConfig,
      config
    );
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}

export class TestSetupWithNamedInstances extends Bindable {
  constructor(public container: DIContainer, config: DependenciesConfig) {
    super();

    this.requireDependency(TestNamedDependency.dependencyType);
    DefaultTestDependenciesWithInstances.apply(this);

    container.registerInstance<DependenciesConfig>(
      Types.dependenciesConfig,
      config
    );
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}

export class TestSetupWithStrategyInstances extends Bindable {
  constructor(public container: DIContainer, config: DependenciesConfig) {
    super();

    this.requireDependency(TestStrategyDependency.dependencyType);
    DefaultTestStrategyDependencies.apply(this);

    container.registerInstance<DependenciesConfig>(
      Types.dependenciesConfig,
      config
    );
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}

export class TestSetupNoFactory extends Bindable {
  constructor(public container: DIContainer, config: DependenciesConfig) {
    super();

    container.registerInstance<DependenciesConfig>(
      Types.dependenciesConfig,
      config
    );
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}

export class TestSetupNoDefaultDependencies extends Bindable {
  constructor(public container: DIContainer, config: DependenciesConfig) {
    super();

    this.requireDependency(TestDependency.dependencyType);

    container.registerInstance<DependenciesConfig>(
      Types.dependenciesConfig,
      config
    );
  }

  public start(): void {
    this.bindDependencies(this.container);
  }
}
