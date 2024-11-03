import { JSONFile } from 'lowdb/node';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import type { PackageJson } from '#/types/PackageJson.js';

const logger = new Logger('config/getPackage');

export const getPackage = async () => {
  const packageJson = await new JSONFile<PackageJson>('package.json').read();
  if (!packageJson) {
    throw new Error('npl must be executed in a directory containing a package.json file.');
  }
  logger.debug('Found package.json', colors.yellow(JSON.stringify(packageJson)));
  return packageJson;
};
