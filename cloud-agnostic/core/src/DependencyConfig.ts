/*-----------------------------------------------------------------------------
|  $Copyright: (c) 2021 Bentley Systems, Incorporated. All rights reserved. $
 *----------------------------------------------------------------------------*/
export interface DependencyConfig {
  dependencyName: string;
}

export interface DependenciesConfig {
  [dependencyType: string]: DependencyConfig;
}
