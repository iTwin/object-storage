/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { Container } from "inversify";
import { S3ClientWrapperFactory } from "./S3ClientWrapperFactory";

export class CommonBindings {
  public static register(
    container: Container,
  ): void {
    if (!container.isBound(S3ClientWrapperFactory))
      container.bind(S3ClientWrapperFactory).toSelf().inSingletonScope();
  }
}
