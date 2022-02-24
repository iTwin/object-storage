/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
export class ExtensionError extends Error {
  constructor(
    message: string,
    public readonly extensionType: string,
    public readonly registered?: string[]
  ) {
    super(
      `${extensionType} ${message}.${
        registered && registered.length > 0
          ? ` Registered extensions: ${registered}`
          : ""
      }`
    );
  }
}

export class ConfigError<T> extends Error {
  constructor(property: keyof T) {
    super(`${property} is not defined in configuration`);
  }
}

export class FalsyPropertyError extends Error {
  constructor(propertyPath: string) {
    super(`${propertyPath} is falsy`);
  }
}

export class InvalidTypeError extends Error {
  constructor(propertyPath: string, expectedTypeName: string) {
    super(`${propertyPath} should be of type '${expectedTypeName}''`);
  }
}
