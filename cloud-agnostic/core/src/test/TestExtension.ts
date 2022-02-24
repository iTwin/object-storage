/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Extendable, Extension } from "..";

import { ConcreteTest, Test, TestConfig, testConfigType } from "./Test";

export class DefaultTestExtensions {
  public static apply(extendable: Extendable): void {
    extendable.useExtension(ConcreteTestExtension);
  }
}

export abstract class TestExtension extends Extension {
  public static readonly extensionType = "testType";
  public readonly extensionType = TestExtension.extensionType;
}

export class ConcreteTestExtension extends TestExtension {
  public readonly extensionName = "testName";

  public bind(container: Container, config: TestConfig): void {
    container.bind<TestConfig>(testConfigType).toDynamicValue(() => config);
    container.bind(Test).to(ConcreteTest).inSingletonScope();
  }
}
