/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { ExtensionError } from "./Errors";
import { Extension } from "./Extension";
import { ExtensionsConfig } from "./ExtensionConfig";
import {
  ExtensionFactory,
  ExtensionRegistration,
  FactoryRegistration,
} from "./ExtensionFactory";
import { Types } from "./Types";

// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor = new (...args: any[]) => {};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extend<TBase extends Constructor>(base: TBase) {
  return class Extending extends base {
    public extensionFactories = new Map<string, ExtensionFactory<Extension>>();

    public requireExtension(
      registration: FactoryRegistration<Extension>
    ): void {
      this.extensionFactories.set(
        registration.extensionType,
        new registration.factoryConstructor(
          registration.extensionType,
          registration.defaultExtensions
        )
      );
    }

    public useExtension(registration: ExtensionRegistration<Extension>): void {
      if (!this.extensionFactories.has(registration.extensionType))
        throw new ExtensionError(
          `factory is not registered, use "${Extending.prototype.requireExtension.name}" method`,
          registration.extensionType
        );

      this.extensionFactories
        .get(registration.extensionType)!
        .addExtension(registration);
    }

    public bindExtensions(container: Container): void {
      const config = container.get<ExtensionsConfig>(Types.extensionsConfig);

      this.extensionFactories.forEach((factory) => {
        const extensionConfig = config[factory.extensionType];
        factory
          .getExtension(extensionConfig.extensionName)
          .bind(container, extensionConfig);
      });
    }
  };
}
