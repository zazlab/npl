import type { Low } from 'lowdb';
import type { GlobalConfig } from './GlobalConfig.js';
import type { LocalConfig } from './LocalConfig.js';
import type { NplPaths } from './NplPaths.js';
import type { PackageJson } from './PackageJson.js';

export type NplArgv<T = void> = T & {
  config: {
    packageJson: PackageJson;
    localConfigDB: Low<LocalConfig>;
    globalConfigDB: Low<GlobalConfig>;
    paths: NplPaths;
  };
};
