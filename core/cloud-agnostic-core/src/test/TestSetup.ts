/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ExtensionsConfig, Types } from "..";

export class TestSetup {
  constructor(public container: Container, config: ExtensionsConfig) {
    container
      .bind<ExtensionsConfig>(Types.extensionsConfig)
      .toDynamicValue(() => config);
  }
}
