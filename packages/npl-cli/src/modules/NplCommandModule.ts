import type { ArgumentsCamelCase, CommandModule } from 'yargs';
import type { NplCommand } from '#/enums/NplCommand.js';
import type { NplArgv } from '#/types/NplArgv.js';
import { useCommandHook } from './hooks/useCommandHook.js';

export const NplCommandModule = <T, U extends NplArgv>(
  command: NplCommand,
  module: CommandModule<T, U> & { preFallback?: string; postFallback?: string },
): CommandModule<T, U> => {
  return {
    command,
    ...module,
    handler: async (argv) => {
      await useCommandHook<ArgumentsCamelCase<U>>({
        argv,
        command,
        hook: 'pre',
        fallback: module.preFallback,
      });

      await module.handler(argv);

      await useCommandHook<ArgumentsCamelCase<U>>({
        argv,
        command,
        hook: 'post',
        fallback: module.postFallback,
      });
    },
  };
};
