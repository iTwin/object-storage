/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ExtensionError } from "./Errors";
import { Extension } from "./Extension";
import { ExtensionsConfig } from "./ExtensionConfig";
import { ExtensionFactory } from "./ExtensionFactory";
import { Types } from "./Types";

export abstract class Extendable {
  private _extensionFactories = new Map<string, ExtensionFactory>();

  protected requireExtension(extensionType: string): void {
    const factory = new ExtensionFactory(extensionType);
    this._extensionFactories.set(factory.extensionType, factory);
  }

  public useExtension(extensionConstructor: new () => Extension): void {
    const extension = new extensionConstructor();
    const factory = this._extensionFactories.get(extension.extensionType);

    if (!factory)
      throw new ExtensionError(
        `factory is not registered, use "${Extendable.prototype.requireExtension.name}" method`,
        extension.extensionType
      );

    factory.addExtension(extension);
  }

  // should be protected but is set public for tests
  public bindExtensions(container: Container): void {
    const config = container.get<ExtensionsConfig>(Types.extensionsConfig);

    this._extensionFactories.forEach((factory) => {
      const extensionConfig = config[factory.extensionType];
      factory
        .getExtension(extensionConfig.extensionName)
        .bind(container, extensionConfig);
    });
  }
}
