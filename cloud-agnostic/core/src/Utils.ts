/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { FalsyPropertyError, InvalidTypeError } from "./Errors";

export function assertValueIsTruthyAndOfType(
  value: unknown,
  readablePath: string,
  expectedPropertyType: "string" | "object"
): void {
  if (!value) throw new FalsyPropertyError(readablePath);
  if (typeof value !== expectedPropertyType)
    throw new InvalidTypeError(readablePath, expectedPropertyType);
}
