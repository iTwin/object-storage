/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Dependency } from "./Dependency";
import { DependencyError } from "./Errors";

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
        `Dependency "${name}" is not registered`,
        this.dependencyType,
        [...this._dependencyMap.keys()]
      );

    return dependency;
  }
}
