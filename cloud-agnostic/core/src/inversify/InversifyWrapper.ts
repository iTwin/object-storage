/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import "reflect-metadata";

import { Container, decorate, injectable } from "inversify";

import { DIContainer } from "../DIContainer";
import { Constructor, DIIdentifier } from "../internal";

const PARAM_TYPES = "inversify:paramtypes";

export class InversifyWrapper extends DIContainer {
  constructor(private readonly _container: Container) {
    super();
  }

  public get container(): Container {
    return this._container;
  }

  public static create(): DIContainer {
    return new InversifyWrapper(new Container());
  }

  private needsDecoration<T>(key: DIIdentifier<T>): key is Constructor<T> {
    if (typeof key === "symbol") return false;
    return Reflect.hasOwnMetadata(PARAM_TYPES, key);
  }

  public override registerFactory<T>(
    key: DIIdentifier<T>,
    factory: (container: DIContainer) => T
  ): void {
    if (this.needsDecoration(key)) {
      decorate(injectable(), key);
    }

    this._container
      .bind<T>(key)
      .toDynamicValue(() => factory(this))
      .inSingletonScope();
  }

  public override registerNamedFactory<T>(
    key: DIIdentifier<T>,
    factory: (container: DIContainer) => T,
    name: string
  ): void {
    if (this.needsDecoration(key)) {
      decorate(injectable(), key);
    }

    this._container
      .bind<T>(key)
      .toDynamicValue(() => factory(this))
      .whenNamed(name);
  }

  public override registerInstance<T>(key: DIIdentifier<T>, instance: T): void {
    this._container.bind<T>(key).toConstantValue(instance);
  }

  public override unregister<T>(key: DIIdentifier<T>): void {
    this._container.unbindSync(key);
  }

  public override resolve<T>(key: DIIdentifier<T>): T {
    return this._container.get<T>(key);
  }

  public override resolveNamed<T>(key: DIIdentifier<T>, name: string): T {
    return this._container.get<T>(key, { name: name });
  }

  public override resolveAll<T>(key: DIIdentifier<T>): T[] {
    return this._container.getAll<T>(key);
  }

  public override createChild(): DIContainer {
    return new InversifyWrapper(new Container({ parent: this._container }));
  }

  public override isRegistered<T>(key: DIIdentifier<T>): boolean {
    return this._container.isBound(key);
  }
}
