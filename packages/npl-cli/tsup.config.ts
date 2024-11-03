import { defineConfig } from 'tsup';
import pkg from './package.json' assert { type: 'json' };

if (!pkg.version) {
  throw new Error('npl package must define a version number.');
}

export default defineConfig({
  entry: ['src/npl.ts'],
  format: ['esm'],
  platform: 'node',
  clean: true,
  minify: true,
  define: {
    'process.env.NPL_VERSION': JSON.stringify(pkg.version),
  },
});
