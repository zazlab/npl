import ipc from 'node-ipc';

ipc.config.id = 'npl_ipc_server';
ipc.config.retry = 3000;
ipc.config.silent = true;
ipc.config.maxRetries = 3;

ipc.serve(() => {
  ipc.server.on('connected', (data, socket) => {
    console.log('Received message:', data);
    ipc.server.emit(socket, 'hello-world', true);
  });
});

ipc.server.start();
