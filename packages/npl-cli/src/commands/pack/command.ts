import { execa } from 'execa';
import fs from 'fs-extra';
import { extract } from 'tar';
import { NplCommand } from '#/enums/NplCommand.js';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import { NplCommandModule } from '#/modules/NplCommandModule.js';
import type { NplArgv } from '#/types/NplArgv.js';

const logger = new Logger('commands/pack');

export const Pack = NplCommandModule<void, NplArgv>(NplCommand.PACK, {
  describe: 'Packs a provider package and makes it accessible to consumers.',
  preFallback: 'build',
  handler: async (argv) => {
    const {
      config: {
        paths: {
          local: { nplDir: localDirectory, packDir },
        },
        globalConfigDB,
        packageJson,
      },
    } = argv;

    logger.debug('Cleaning global provider entry.');
    globalConfigDB.data.providers[packageJson.name] = undefined;
    await globalConfigDB.write();

    logger.debug('Cleaning local pack directory.');
    await fs.emptyDir(packDir);

    logger.debug('Executing pack.');
    const { stdout: packResult } = await execa('npm', [
      'pack',
      '--pack-destination',
      localDirectory,
      '--json',
    ]);
    logger.debug('Pack result.', colors.yellow(packResult));
    const [{ filename }] = JSON.parse(packResult);

    const compressedFile = `${localDirectory}/${filename}`;
    logger.debug('Extracting pack.', colors.yellow(compressedFile));
    await extract({
      file: compressedFile,
      cwd: localDirectory,
    });

    logger.debug('Updating global provider entry.');
    globalConfigDB.data.providers[packageJson.name] = packDir;
    await globalConfigDB.write();

    logger.debug('Deleting compressed pack.');
    await fs.remove(compressedFile);
  },
});
