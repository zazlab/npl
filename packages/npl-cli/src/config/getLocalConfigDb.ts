import { JSONFilePreset } from 'lowdb/node';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import type { LocalConfig } from '#/types/LocalConfig.js';

const logger = new Logger('config/getLocalConfigDb');

export const getLocalConfigDb = async (location: string) => {
  logger.debug(`Searching local config DB at: ${colors.yellow(location)}`);
  const config = await JSONFilePreset<LocalConfig>(location, {
    links: {},
    scripts: {},
    watchFiles: ['src', 'package.json'],
  });
  logger.debug('Found local config DB.', colors.yellow(JSON.stringify(config.data)));
  await config.write();
  return config;
};
