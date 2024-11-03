import { checkbox } from '@inquirer/prompts';
import { execa } from 'execa';
import fs from 'fs-extra';
import { NplCommand } from '#/enums/NplCommand.js';
import { Logger } from '#/logging/Logger.js';
import { colors } from '#/logging/colors.js';
import { NplCommandModule } from '#/modules/NplCommandModule.js';
import type { NplArgv } from '#/types/NplArgv.js';

const logger = new Logger('commands/link');

export const Link = NplCommandModule<void, NplArgv>(NplCommand.LINK, {
  describe: 'Links one or more provided packages locally.',
  handler: async (argv) => {
    const {
      config: { globalConfigDB, localConfigDB, packageJson },
    } = argv;

    const installedDeps = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ]);
    logger.debug('Installed dependencies found.', [...installedDeps]);
    const nplProviders = Object.keys(globalConfigDB.data.providers);
    logger.debug('Local packages provided by npl found.', nplProviders);
    const nplLinkedPackages = new Set(Object.keys(localConfigDB.data.links));
    logger.debug('Existing npl liks found.', [...nplLinkedPackages]);
    const validChoices = nplProviders.filter(
      (provider) => installedDeps.has(provider) && !nplLinkedPackages.has(provider),
    );
    logger.debug('Valid choices:', validChoices);
    const choices = validChoices.map((pkg) => ({ name: pkg, value: pkg }));

    if (!choices.length) {
      logger.info(
        'No available packages to link. Execute',
        colors.yellow('npl pack'),
        'in a installed local package to link it.',
      );
      return;
    }

    const answers = await checkbox({
      message: 'Select packages to link.',
      choices,
    });

    if (!answers.length) {
      logger.info('No packages selected. Skipping.');
      return;
    }

    logger.debug('Retrieving origins with', colors.yellow('npm ll -p'));
    const { stdout: llOutput } = await execa('npm', ['ll', '-p']);

    const origins: Record<string, string | undefined> = Object.fromEntries(
      llOutput.split(/\r?\n/).map((line) => {
        const [origin, pkgId] = line.trim().split(':');
        const [pkgName] = pkgId.split(/(?<!^)@/);
        return [pkgName, origin];
      }),
    );
    logger.debug('origins', origins);

    for (const link of answers) {
      const originDirPath = origins[link];
      const providerDirPath = globalConfigDB.data.providers[link];
      const providerExists = providerDirPath && (await fs.pathExists(providerDirPath));

      if (!originDirPath) {
        logger.error('Could not locate installed package directory.', originDirPath);
        continue;
      }

      if (!providerExists) {
        logger.error('Could not locate provided package directory.', providerDirPath);
        continue;
      }

      logger.debug('Deleting origin folder.', originDirPath);
      const originDestExists = await fs.pathExists(originDirPath);
      if (originDestExists) {
        await fs.remove(originDirPath);
      }

      logger.debug('Symlink provider to origin directory.', providerDirPath, originDirPath);
      await fs.ensureSymlink(providerDirPath, originDirPath);

      logger.debug('Storing link metadata in npl config.');
      localConfigDB.data.links[link] = originDirPath;
      await localConfigDB.write();

      logger.info('Provider linked.', link);
    }
  },
});
