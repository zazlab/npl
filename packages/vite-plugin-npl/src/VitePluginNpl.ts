import path from 'node:path';
import { execa } from 'execa';
import ipc from 'node-ipc';
import type { Plugin, ViteDevServer } from 'vite';

ipc.config.id = 'npl_ipc';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.config.maxRetries = 2;

export type VitePluginNplOptions = {
  name: string;
  type: 'application' | 'library';
  debounce?: number;
  packDestination?: string;
} & (
  | {
      type: 'application';
      consumers?: never;
      localDeps: string[];
    }
  | {
      type: 'library';
      consumers: string[];
      localDeps?: never;
    }
);

export const VitePluginNpl = (opts: VitePluginNplOptions): Plugin[] => {
  const PLUGIN_NAME = 'vite-plugin-npl';
  const {
    name: currentPackage,
    type,
    debounce = 3000,
    packDestination,
    consumers = [],
    localDeps = [],
  } = opts;

  let timeout: NodeJS.Timeout | null = null;
  let taskCompleted = false;
  let viteConfigPath: string;

  const plugins: Plugin[] = [
    {
      name: `${PLUGIN_NAME}-config-path`,
      configResolved(config) {
        viteConfigPath = config.configFile as string;
      },
    },
  ];

  if (type === 'library') {
    plugins.push({
      name: `${PLUGIN_NAME}-library:serve`,
      apply: 'serve',
      async handleHotUpdate({ server }) {
        if (server.config.mode !== 'development') {
          return;
        }

        if (timeout && taskCompleted) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(async () => {
          taskCompleted = false;

          console.log('Building new package.');
          const destPath = path.resolve(path.dirname(viteConfigPath), packDestination ?? '.npl');
          try {
            await execa('npm', ['run', 'build']);
            await execa('mkdir', ['-p', destPath]);
            console.log(destPath);
          } catch (error) {
            console.error(error);
          }

          try {
            const { stdout } = await execa('npm', [
              'pack',
              '--json',
              '--pack-destination',
              destPath,
            ]);
            const results = JSON.parse(stdout);
            const consumerPromises = consumers
              .map((consumer) => {
                return `${PLUGIN_NAME}:${consumer}`;
              })
              .map((consumerIpcId) => {
                return new Promise((resolve) => {
                  ipc.connectTo(consumerIpcId, () => {
                    ipc.of[consumerIpcId].on('connect', () => {
                      for (const result of results) {
                        console.log(JSON.stringify(result, null, 2));
                        ipc.of[consumerIpcId].emit(`${PLUGIN_NAME}:${currentPackage}`, {
                          ...result,
                          absolutePath: path.resolve(destPath, result.filename),
                        });
                      }
                    });

                    ipc.of[consumerIpcId].on(`${PLUGIN_NAME}:${currentPackage}:ok`, (data) => {
                      ipc.disconnect(consumerIpcId);
                      resolve(data);
                    });

                    ipc.of[consumerIpcId].on('error', () => {
                      console.log('No consumers are watching this package.');
                      ipc.disconnect(consumerIpcId);
                      resolve(undefined);
                    });
                  });
                });
              });

            await Promise.all(consumerPromises);
          } catch (error) {
            console.error(error);
          } finally {
            taskCompleted = true;
          }
        }, debounce);
      },
    });
  }

  if (type === 'application') {
    ipc.serve(() => {
      for (const localDep of localDeps) {
        ipc.server.on('message', async (data, socket) => {
          console.log('Received message:', data);
          await execa('echo', [`"${JSON.stringify(data, null, 2)}"`, '>', 'data.json']);
          ipc.server.emit(socket, `${PLUGIN_NAME}:${localDep}:ok`, true);
        });
      }
    });

    ipc.server.start();

    plugins.push({
      name: `${PLUGIN_NAME}-application:serve`,
      apply: 'serve',
      configResolved(config) {
        if (config.optimizeDeps.exclude?.length) {
          config.optimizeDeps.exclude = config.optimizeDeps.exclude.concat(localDeps);
        } else {
          config.optimizeDeps.exclude = localDeps;
        }
      },
      configureServer: (server: ViteDevServer): void => {
        const pattern = `/node_modules\\/(?!${localDeps.join('|')}).*/`;
        server.watcher.options = {
          ...server.watcher.options,
          ignored: [new RegExp(pattern), '**/.git/**'],
        };
      },
      handleHotUpdate({ file, server }) {
        if (
          type === 'application' &&
          localDeps.some((local) => file.includes(`node_modules/${local}`))
        ) {
          const moduleId = server.moduleGraph.getModuleById(file);
          if (moduleId) {
            server.moduleGraph.invalidateModule(moduleId);

            server.ws.send({
              type: 'full-reload',
              path: '*',
            });
          }
        }
      },
    });
  }

  return plugins;
};
