/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";
import { BlockBlobClientWrapperFactory } from "./BlockBlobClientWrapperFactory";

export class CommonBindings {
  public static register(
    container: Container,
  ): void {
    if (!container.isBound(BlockBlobClientWrapperFactory))
      container.bind(BlockBlobClientWrapperFactory).toSelf().inSingletonScope();
  }
}
