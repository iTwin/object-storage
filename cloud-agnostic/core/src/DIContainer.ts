/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { DIIdentifier } from "./internal";

export abstract class DIContainer {
  abstract registerFactory<T>(
    key: DIIdentifier<T>,
    factory: (container: DIContainer) => T
  ): void;

  abstract registerNamedFactory<T>(
    key: DIIdentifier<T>,
    factory: (container: DIContainer) => T,
    name: string
  ): void;

  abstract registerInstance<T>(key: DIIdentifier<T>, instance: T): void;

  abstract unregister<T>(key: DIIdentifier<T>): void;

  abstract resolve<T>(key: DIIdentifier<T>): T;

  abstract resolveNamed<T>(key: DIIdentifier<T>, name: string): T;

  abstract resolveAll<T>(key: DIIdentifier<T>): T[];

  abstract createChild(): DIContainer;
}
