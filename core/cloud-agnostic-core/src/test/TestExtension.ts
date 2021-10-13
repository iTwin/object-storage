/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
import { Container } from "inversify";

import { Extension } from "..";

import { ConcreteTest, Test, TestConfig, testConfigType } from "./Test";

export abstract class TestExtension extends Extension {
  public static extensionType = "testType";
}

export class ConcreteTestExtension extends TestExtension {
  public static extensionName = "testName";

  public bind(container: Container, config: TestConfig): void {
    container.bind<TestConfig>(testConfigType).toDynamicValue(() => config);
    container.bind(Test).to(ConcreteTest).inSingletonScope();
  }
}
