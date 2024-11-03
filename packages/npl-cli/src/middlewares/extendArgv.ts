import type { MiddlewareFunction } from 'yargs';
import { getConfigPaths } from '#/config/getConfigPaths.js';
import { getGlobalConfigDb } from '#/config/getGlobalConfigDb.js';
import { getLocalConfigDb } from '#/config/getLocalConfigDb.js';
import { getPackage } from '#/config/getPackage.js';
import { Logger } from '#/logging/Logger.js';

const logger = new Logger('middlewares/globalArgv');

export const extendArgv: MiddlewareFunction = async (argv) => {
  const packageJson = await getPackage();
  const paths = await getConfigPaths();
  const localConfigDB = await getLocalConfigDb(paths.local.configFile);
  const globalConfigDB = await getGlobalConfigDb(paths.global.configFile);

  logger.debug('Extending arguments with configuration.');
  argv.config = {
    packageJson,
    paths,
    localConfigDB,
    globalConfigDB,
  };
};
