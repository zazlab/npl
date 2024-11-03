#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { commands } from '#/commands/index.js';
import { Logger } from '#/logging/Logger.js';
import { middlewares } from '#/middlewares/index.js';

const logger = new Logger('npl');

const TERMINAL_WIDTH = yargs(process.argv).terminalWidth();
const MAX_WIDTH = 120;
const WIDTH = TERMINAL_WIDTH > MAX_WIDTH ? MAX_WIDTH : TERMINAL_WIDTH;

yargs(hideBin(process.argv))
  .scriptName('npl')
  .version(process.env.NPL_VERSION ?? 'unknown')
  .middleware(middlewares)
  .command(commands)
  .wrap(WIDTH)
  .help()
  .alias('help', 'h')
  .alias('version', 'v')
  .demandCommand(1, 'You need to provide at least one command or option.')
  .strict()
  .fail((msg, err, yargs) => {
    if (!err) {
      if (msg) {
        logger.error(msg);
      }
      yargs.showHelp('log');
    } else {
      logger.error(err.message);
    }
    process.exit(1);
  })
  .parse();
