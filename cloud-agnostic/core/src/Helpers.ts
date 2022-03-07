/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { FalsyValueError, InvalidTypeError } from "./Errors";

export function assertPrimitiveType(
  value: unknown,
  valueName: string,
  expectedValueType: "string" | "object"
): void {
  if (!value) throw new FalsyValueError(valueName);
  if (!(typeof value === expectedValueType))
    throw new InvalidTypeError(valueName, expectedValueType);
}

export function assertInstanceType<T>(
  value: unknown,
  valueName: string,
  instanceConstructor: new () => T
): void {
  if (!value) throw new FalsyValueError(valueName);
  if (!(value instanceof instanceConstructor))
    throw new InvalidTypeError(valueName, instanceConstructor.name);
}
