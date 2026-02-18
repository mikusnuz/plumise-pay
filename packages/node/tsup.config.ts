import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  platform: 'node',
  external: ['@plumise/core', 'viem'],
  tsconfig: 'tsconfig.json',
})
