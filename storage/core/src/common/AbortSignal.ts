/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbortSignalListener = (this: GenericAbortSignal, ev: any) => any;

export interface GenericAbortSignal {
  aborted: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onabort: ((this: any, ev: any) => any) | null;
  addEventListener: (type: "abort", listener: AbortSignalListener) => void;
  removeEventListener: (type: "abort", listener: AbortSignalListener) => void;
}

export function createClientAbortSignal(
  userAbortSignal: GenericAbortSignal
): AbortSignal {
  if (userAbortSignal.aborted) {
    return AbortSignal.abort();
  }

  const controller = new AbortController();

  const abortListener = () => {
    userAbortSignal.removeEventListener("abort", abortListener);
    controller.abort();
  };

  userAbortSignal.addEventListener("abort", abortListener);

  return controller.signal;
}
