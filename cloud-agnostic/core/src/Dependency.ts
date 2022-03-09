/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { DependencyConfig } from "./DependencyConfig";

export abstract class Dependency {
  public abstract dependencyName: string;
  public abstract dependencyType: string;
  public abstract register(
    container: Container,
    config: DependencyConfig
  ): void;
}
