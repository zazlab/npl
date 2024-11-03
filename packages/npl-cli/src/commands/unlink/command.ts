import { execa } from 'execa';
import { NplCommand } from '#/enums/NplCommand.js';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import { NplCommandModule } from '#/modules/NplCommandModule.js';
import type { NplArgv } from '#/types/NplArgv.js';

const logger = new Logger('commands/unlink');

export const Unlink = NplCommandModule<void, NplArgv>(NplCommand.UNLINK, {
  describe: 'Unlinks all provided packages locally.',
  handler: async (argv) => {
    const {
      config: { localConfigDB },
    } = argv;

    logger.debug('Retrieving project root with', colors.yellow('npm ll -p'));
    const { stdout: llOutput } = await execa('npm', ['ll', '-p']);
    const [firstLine] = llOutput.split(/\r?\n/);
    const [projectRoot] = firstLine.trim().split(':');
    logger.debug('Project root path.', colors.yellow(projectRoot));

    logger.debug('Cleaning local npl links config.');
    localConfigDB.data.links = {};
    await localConfigDB.write();

    logger.debug('Reinstalling dependencies with', colors.yellow('npm install'));
    await execa('npm', ['install'], {
      cwd: projectRoot,
    });
  },
});
