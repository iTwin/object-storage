/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { ExtensionError } from "./Errors";
import { Extension } from "./Extension";

export type FactoryConstructor<T extends Extension> = new (
  extensionType: string,
  defaultExtensions?: ExtensionRegistration<T>[]
) => ExtensionFactory<T>;

export type ExtensionConstructor<T extends Extension> = new () => T;

export interface FactoryRegistration<T extends Extension> {
  extensionType: string;
  defaultExtensions?: ExtensionRegistration<T>[];
  factoryConstructor: FactoryConstructor<T>;
}

export interface ExtensionRegistration<T extends Extension> {
  extensionType: string;
  extensionName: string;
  extensionConstructor: ExtensionConstructor<T>;
}

export class ExtensionFactory<T extends Extension> {
  private _extensionMap = new Map<string, ExtensionConstructor<T>>();

  constructor(
    public readonly extensionType: string,
    defaultExtensions?: ExtensionRegistration<T>[]
  ) {
    defaultExtensions?.forEach((x) => this.addExtension(x));
  }

  public addExtension(registration: ExtensionRegistration<T>): void {
    this._extensionMap.set(
      registration.extensionName,
      registration.extensionConstructor
    );
  }

  public getExtension(name: string): T {
    if (!this._extensionMap.has(name))
      throw new ExtensionError(
        `extension "${name}" is not registered`,
        this.extensionType,
        [...this._extensionMap.keys()]
      );

    return new (this._extensionMap.get(name)!)();
  }
}
