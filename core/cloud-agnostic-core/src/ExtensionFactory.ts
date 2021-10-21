/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { ExtensionError } from "./Errors";
import { Extension } from "./Extension";

export class ExtensionFactory {
  private _extensionMap = new Map<string, Extension>();

  constructor(
    public readonly extensionType: string,
    defaultExtensions?: (new () => Extension)[]
  ) {
    defaultExtensions?.forEach((x) => this.addExtension(new x()));
  }

  public addExtension(extension: Extension): void {
    this._extensionMap.set(extension.extensionName, extension);
  }

  public getExtension(name: string): Extension {
    const extension = this._extensionMap.get(name);

    if (!extension)
      throw new ExtensionError(
        `extension "${name}" is not registered`,
        this.extensionType,
        [...this._extensionMap.keys()]
      );

    return extension;
  }
}
