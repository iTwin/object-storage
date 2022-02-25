/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2022 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { FalsyValueError, InvalidTypeError } from "./Errors";

export function assertTypeAndValue(
  value: unknown,
  valueName: string,
  expectedValueType: "string" | "object" | "Date"
): void {
  if (!value) throw new FalsyValueError(valueName);

  let isValueOfType;
  switch (expectedValueType) {
    case "Date":
      isValueOfType = value instanceof Date;
      break;
    case "string":
    case "object":
      isValueOfType = typeof value === expectedValueType;
      break;
  }

  if (!isValueOfType) throw new InvalidTypeError(valueName, expectedValueType);
}
