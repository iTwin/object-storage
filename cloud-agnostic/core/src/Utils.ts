/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { FalsyValueError, InvalidTypeError } from "./Errors";

export function assertTypeAndValue(
  value: unknown,
  valueName: string,
  expectedValueType: "string" | "object"
): void {
  if (!value) throw new FalsyValueError(valueName);
  if (typeof value !== expectedValueType)
    throw new InvalidTypeError(valueName, expectedValueType);
}
