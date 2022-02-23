/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ExtensionConfig } from "./ExtensionConfig";

export abstract class Extension {
  public abstract extensionName: string;
  public abstract extensionType: string;
  public abstract bind(container: Container, config: ExtensionConfig): void;
}
