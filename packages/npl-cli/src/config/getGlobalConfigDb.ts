import { JSONFilePreset } from 'lowdb/node';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import type { GlobalConfig } from '#/types/GlobalConfig.js';

const logger = new Logger('config/getGlobalConfigDb');

export const getGlobalConfigDb = async (location: string) => {
  logger.debug(`Searching global config DB at: ${colors.yellow(location)}`);
  const globalConfig = await JSONFilePreset<GlobalConfig>(location, { providers: {} });
  logger.debug('Found global config DB.', colors.yellow(JSON.stringify(globalConfig.data)));
  await globalConfig.write();
  return globalConfig;
};
