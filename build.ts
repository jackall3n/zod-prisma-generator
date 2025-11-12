await Bun.build({
    entrypoints: ['./src/index.ts', './src/bin.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    sourcemap: true,
    splitting: true,
    minify: true,
    packages: 'external',
});