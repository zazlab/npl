import chokidar from 'chokidar';
import { execa } from 'execa';
import { NplCommand } from '#/enums/NplCommand.js';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import { emoji } from '#/logging/emoji.js';
import { NplCommandModule } from '#/modules/NplCommandModule.js';
import type { NplArgv } from '#/types/NplArgv.js';
import { debounce } from '#/utils/debounce.js';

const logger = new Logger('commands/watch');

export const Watch = NplCommandModule<void, NplArgv>(NplCommand.WATCH, {
  describe: 'Watch for changes and execute `npl pack`.',
  handler: async (argv) => {
    const {
      config: { localConfigDB },
    } = argv;

    const { watchFiles } = localConfigDB.data;
    logger.debug('Watching files.', watchFiles);

    const watcher = chokidar.watch(watchFiles, {
      persistent: true,
      ignoreInitial: true,
    });

    const onChange = async (path: string) => {
      try {
        logger.debug('File changed', path);
        logger.info('Detected changes. Building pack...');
        await execa('npl', ['pack']);
        logger.log(emoji.SUCCESS, colors.yellow('npl pack'), 'built successfully!');
      } catch (error) {
        logger.error(error);
      }
    };

    const debouncedOnChange = debounce(onChange, 1000);

    await new Promise((resolve) => {
      watcher.on('all', (_event, path) => {
        debouncedOnChange(path);
      });

      watcher.on('error', (error) => {
        logger.error(error);
      });

      const cleanup = () => {
        watcher.close();
        resolve(undefined);
      };

      process.on('SIGTERM', cleanup);
      process.on('SIGINT', cleanup);
    });
  },
});
