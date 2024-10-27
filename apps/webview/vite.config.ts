import npl from '@npl/vite-plugin-npl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  plugins: [
    react(),
    npl({
      name: 'webview',
      type: 'application',
      localDeps: ['@npl/demo-lib'],
    }),
  ],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
}));
