/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { DependencyConfig } from "./DependencyConfig";
import { DIContainer } from "./DIContainer";

export abstract class Dependency {
  public abstract dependencyName: string;
  public abstract dependencyType: string;
  public abstract register(
    container: DIContainer,
    config?: DependencyConfig
  ): void;
}
