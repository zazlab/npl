import { execa } from 'execa';
import type { ArgumentsCamelCase } from 'yargs';
import type { NplCommand } from '#/enums/NplCommand.js';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import { emoji } from '#/logging/emoji.js';
import type { NplArgv } from '#/types/NplArgv.js';
import type { NplScriptHook } from '#/types/NplScriptHook.js';
import type { NplScriptKey } from '#/types/NplScriptKey.js';

const logger = new Logger('hooks/usePreCommandScript');

export const useCommandHook = async <
  Argv extends ArgumentsCamelCase<NplArgv> = ArgumentsCamelCase<NplArgv>,
>(opts: {
  argv: Argv;
  command: NplCommand;
  hook: NplScriptHook;
  fallback?: string;
}) => {
  const { argv, hook, command, fallback } = opts;
  const {
    config: { localConfigDB, packageJson },
  } = argv;

  if (!hook || !command) {
    return;
  }

  const scriptName: NplScriptKey = `${hook}${command}`;

  logger.debug(`Searching ${scriptName} script.`);
  const script =
    localConfigDB.data.scripts?.[scriptName] ?? (fallback && packageJson.scripts?.[fallback]);

  if (script) {
    logger.debug(`Found ${scriptName} script.`, colors.yellow(script));

    const scriptParts = script.split(' ');
    const { stdout: prepackResult } = await execa('npm', ['exec', '--', ...scriptParts]);

    logger.info(emoji.CONSTRUCTION, `Executed ${scriptName} script.`, colors.yellow(script));
    logger.debug(`${scriptName} result.`, colors.yellow(prepackResult));
  }
};
