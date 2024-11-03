import os from 'node:os';
import { resolve } from 'node:path';
import fsExtra from 'fs-extra';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import type { NplPaths } from '#/types/NplPaths.js';

const logger = new Logger('config/getConfigPaths');

export const getConfigPaths = async (): Promise<NplPaths> => {
  const getConfigPath = (dir: string) => `${dir}/config.json`;
  const nplDirName = process.env.ZAZLAB_NPL_CONFIG_DIRNAME ?? '.npl';

  // Local paths
  const localConfigDir = resolve(process.cwd(), nplDirName);
  const localConfigFile = getConfigPath(localConfigDir);
  const localPackDir = `${localConfigDir}/package`;

  // Global paths
  const globalConfigDir = `${os.homedir()}/${nplDirName}`;
  const globalConfigFile = getConfigPath(globalConfigDir);

  logger.debug(
    'Built config paths.',
    colors.yellow(
      JSON.stringify({
        localConfigDir,
        globalConfigDir,
        localConfigFile,
        globalConfigFile,
      }),
    ),
  );

  logger.debug('Ensuring directories exist.');
  await fsExtra.ensureDir(globalConfigDir);
  await fsExtra.ensureDir(localConfigDir);
  await fsExtra.ensureDir(`${localConfigDir}/package`);
  logger.debug('Ensured directories.');

  return {
    local: {
      nplDir: localConfigDir,
      configFile: localConfigFile,
      packDir: localPackDir,
    },
    global: {
      nplDir: globalConfigDir,
      configFile: globalConfigFile,
    },
  };
};
