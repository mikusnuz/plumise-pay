import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', '@plumise/pay'],
  sourcemap: true,
  clean: true,
  treeshake: true,
})
