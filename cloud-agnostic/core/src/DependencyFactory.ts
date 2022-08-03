/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { NamedDependency } from "./NamedDependency";
import { Dependency } from "./Dependency";
import { DependencyError, DependencyTypeError } from "./internal";

export class DependencyFactory {
  private _dependencyMap = new Map<string, Dependency>();

  constructor(public readonly dependencyType: string) {}

  public addDependency(dependency: Dependency): void {
    this._dependencyMap.set(dependency.dependencyName, dependency);
  }

  public getDependency(name: string): Dependency {
    const dependency = this._dependencyMap.get(name);

    if (!dependency)
      throw new DependencyError(
        `dependency "${name}" is not registered`,
        this.dependencyType,
        [...this._dependencyMap.keys()]
      );

    return dependency;
  }

  public getNamedDependency(name: string): NamedDependency {
    const dependency = this.getDependency(name);
    if (!(dependency instanceof NamedDependency))
      throw new DependencyTypeError(
        `dependency "${name}" does not support named dependency instances`,
        this.dependencyType
      );

    return dependency as NamedDependency;
  }
}
