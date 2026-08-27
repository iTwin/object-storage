/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractConstructor<T> = abstract new (...args: any[]) => T;

export type DIIdentifier<T> = symbol | Constructor<T> | AbstractConstructor<T>;
