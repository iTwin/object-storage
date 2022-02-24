/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Extendable, ExtensionsConfig, Types } from "..";

import { DefaultTestExtensions, TestExtension } from "./TestExtension";

export class TestSetup extends Extendable {
  constructor(public container: Container, config: ExtensionsConfig) {
    super();

    this.requireExtension(TestExtension.extensionType);
    DefaultTestExtensions.apply(this);

    container
      .bind<ExtensionsConfig>(Types.extensionsConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindExtensions(this.container);
  }
}

export class TestSetupNoFactory extends Extendable {
  constructor(public container: Container, config: ExtensionsConfig) {
    super();

    container
      .bind<ExtensionsConfig>(Types.extensionsConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindExtensions(this.container);
  }
}

export class TestSetupNoDefaultExtensions extends Extendable {
  constructor(public container: Container, config: ExtensionsConfig) {
    super();

    this.requireExtension(TestExtension.extensionType);

    container
      .bind<ExtensionsConfig>(Types.extensionsConfig)
      .toDynamicValue(() => config);
  }

  public start(): void {
    this.bindExtensions(this.container);
  }
}
