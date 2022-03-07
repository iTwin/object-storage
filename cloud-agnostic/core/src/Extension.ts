/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ExtensionConfig } from "./ExtensionConfig";

export abstract class Extension {
  public abstract extensionName: string;
  public abstract extensionType: string;
  public abstract bind(container: Container, config: ExtensionConfig): void;
}
