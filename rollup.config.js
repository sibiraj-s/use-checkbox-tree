import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('./package.json'));

export default defineConfig({
  input: './src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {}), 'react/jsx-runtime'],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.lib.json',
    }),
  ],
});
