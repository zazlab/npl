import npl from '@npl/vite-plugin-npl';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    npl({
      name: '@npl/demo-lib',
      type: 'library',
      consumers: ['webview'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'c' : ''}js`,
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    emptyOutDir: true,
  },
}));
