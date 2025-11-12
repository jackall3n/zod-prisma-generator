import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/bin.ts'],
  exports: true,
  external: ["typescript", "@prisma/generator-helper"],
})
