import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  treeshake: true,
  external: ['@plumise/core', 'viem'],
  tsconfig: 'tsconfig.json',
})
