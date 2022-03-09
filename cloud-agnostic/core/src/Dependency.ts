/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
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
