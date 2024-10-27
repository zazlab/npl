import ipc from 'node-ipc';

ipc.config.id = 'npl_ipc_client';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.config.maxRetries = 2;

const serverId = 'npl_ipc_server';

ipc.connectTo('npl_ipc_server', () => {
  ipc.of[serverId].on('connect', () => {
    console.log('connected');

    setInterval(() => {
      ipc.of[serverId].emit('connected', 'connected');
    }, 3000);
  });

  ipc.of[serverId].on('hello-world', (data) => {
    console.log('hello-world', data);
  });

  ipc.of[serverId].on('error', (error) => {
    console.log('Error', error);
  });
});
