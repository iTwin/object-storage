/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

export interface DependencyConfig {
  dependencyName: string;
}

export interface NamedDependencyConfig extends DependencyConfig {
  instanceName: string;
}

export type TypedDependencyConfig =
  | {
      bindingStrategy: "Dependency";
      instance: DependencyConfig;
    }
  | {
      bindingStrategy: "NamedDependency";
      instances: NamedDependencyConfig[];
    }
  | {
      bindingStrategy: "StrategyDependency";
      instance: DependencyConfig;
    };

export interface DependenciesConfig {
  [dependencyType: string]: TypedDependencyConfig;
}
